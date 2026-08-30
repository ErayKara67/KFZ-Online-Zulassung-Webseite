import { getIkfzProvider, pruefeFahrfrist } from "./ikfz";
import { IkfzFehler, type IkfzAntrag, type IkfzAntwort } from "./ikfz/types";
import { VOLLMACHT_VERSION, vollmachtHash } from "./ikfz/vollmacht";
import { getSignatureProvider } from "./signature";
import { getOrder, updateOrder, withTimeline, type StoredOrder } from "./orders-store";
import { notifyAddress, sendMail } from "./mail";
import { site } from "./site";
import { baseUrl } from "./stripe";

/**
 * Serverseitige Ablaufsteuerung eines Auftrags.
 *
 * Die Reihenfolge ist bei der Sofortzulassung nicht beliebig: Der Antrag darf
 * erst eingereicht werden, wenn die Kennzeichenschilder beim Halter sind und
 * die Identifizierung vorliegt. Sonst entsteht ein Zulassungsbescheid, mit dem
 * niemand fahren darf – und die Zehn-Tage-Frist läuft trotzdem.
 */

type Payload = Record<string, unknown>;

function feld<T = string>(payload: unknown, pfad: string[]): T | undefined {
  let aktuell: unknown = payload;
  for (const teil of pfad) {
    if (typeof aktuell !== "object" || aktuell === null) return undefined;
    aktuell = (aktuell as Payload)[teil];
  }
  return aktuell as T | undefined;
}

/** Nach Zahlungseingang: Reservierung und Schilderproduktion anstoßen. */
export async function starteBearbeitung(orderId: string): Promise<StoredOrder | null> {
  const order = await getOrder(orderId);
  if (!order) return null;

  let timeline = withTimeline(order.timeline, "bezahlt");
  timeline = withTimeline(timeline, "kennzeichen_reserviert", "Reservierung bei der Zulassungsbehörde");
  timeline = withTimeline(timeline, "schilder_produziert", "Schilder geprägt");

  return updateOrder(orderId, { status: "in_bearbeitung", timeline });
}

export async function schilderVersandt(orderId: string, sendungsnummer?: string) {
  const order = await getOrder(orderId);
  if (!order) return null;
  return updateOrder(orderId, {
    timeline: withTimeline(
      order.timeline,
      "schilder_versandt",
      sendungsnummer ? `Sendungsnummer ${sendungsnummer}` : undefined,
    ),
  });
}

export async function schilderZugestellt(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return null;
  let timeline = withTimeline(order.timeline, "schilder_versandt");
  timeline = withTimeline(timeline, "schilder_zugestellt", "Zustellung bestätigt");
  return updateOrder(orderId, { timeline });
}

export async function identifizierungAbgeschlossen(orderId: string) {
  const order = await getOrder(orderId);
  if (!order?.ikfz) return null;
  return updateOrder(orderId, {
    timeline: withTimeline(order.timeline, "identifiziert"),
    ikfz: { ...order.ikfz, identifiziertAm: new Date().toISOString() },
  });
}

/**
 * Startet die qualifizierte Signatur der Vollmacht.
 * Im Testbetrieb ist sie sofort „signiert“, aber als simuliert markiert;
 * produktiv kommt eine Weiterleitung zum Vertrauensdiensteanbieter zurück.
 */
export async function vollmachtSignieren(
  orderId: string,
): Promise<{ ok: boolean; hinweis: string; weiterleitungUrl?: string }> {
  const order = await getOrder(orderId);
  if (!order) return { ok: false, hinweis: "Auftrag nicht gefunden." };

  const provider = getSignatureProvider();
  const halterName =
    feld(order.payload, ["holder", "salutation"]) === "firma"
      ? (feld(order.payload, ["holder", "company"]) ?? "")
      : `${feld(order.payload, ["holder", "firstName"]) ?? ""} ${feld(order.payload, ["holder", "lastName"]) ?? ""}`.trim();

  const vorgang = await provider.starten({
    auftragId: order.id,
    istFirma: feld(order.payload, ["holder", "salutation"]) === "firma",
    name: halterName,
    email: order.email,
    dokumentHash: order.vollmacht?.textHash ?? vollmachtHash(),
    rueckkehrUrl: `${baseUrl()}/auftrag/${order.id}?code=${order.accessToken}`,
  });

  const signatur = {
    signaturId: vorgang.signaturId,
    art: vorgang.art,
    status: vorgang.status,
    signiertAm: vorgang.signiertAm,
    pruefung: vorgang.pruefung,
    provider: provider.name,
    simuliert: vorgang.simuliert,
  };

  const timeline =
    vorgang.status === "signiert"
      ? withTimeline(
          order.timeline,
          "vollmacht_signiert",
          vorgang.simuliert ? "Testbetrieb – ohne Rechtswirkung" : `Signiert (${vorgang.art.toUpperCase()})`,
        )
      : order.timeline;

  await updateOrder(orderId, {
    timeline,
    vollmacht: {
      textVersion: order.vollmacht?.textVersion ?? VOLLMACHT_VERSION,
      textHash: order.vollmacht?.textHash ?? vollmachtHash(),
      unterschrift: order.vollmacht?.unterschrift ?? halterName,
      erteiltAm: order.vollmacht?.erteiltAm ?? order.createdAt,
      ip: order.vollmacht?.ip,
      userAgent: order.vollmacht?.userAgent,
      signatur,
    },
  });

  return {
    ok: true,
    hinweis:
      vorgang.status === "signiert"
        ? "Vollmacht signiert."
        : "Bitte schließen Sie die Signatur beim Vertrauensdiensteanbieter ab.",
    weiterleitungUrl: vorgang.weiterleitungUrl,
  };
}

export interface EinreichErgebnis {
  ok: boolean;
  hinweis: string;
  order?: StoredOrder | null;
}

/** Reicht den Antrag ein – nur wenn alle Voraussetzungen erfüllt sind. */
export async function antragEinreichen(orderId: string): Promise<EinreichErgebnis> {
  const order = await getOrder(orderId);
  if (!order || !order.ikfz?.aktiv) {
    return { ok: false, hinweis: "Für diesen Auftrag ist keine Sofortzulassung gebucht." };
  }

  const erledigt = (key: string) => order.timeline.some((t) => t.key === key);

  const schilderWeg = feld(order.payload, ["ikfz", "schilderWeg"]);
  if (schilderWeg !== "vorhanden" && !erledigt("schilder_zugestellt")) {
    return {
      ok: false,
      hinweis:
        "Der Antrag wird eingereicht, sobald die Kennzeichenschilder zugestellt sind. Ohne montierte Schilder dürfte trotz Bescheid nicht gefahren werden.",
    };
  }

  if (!erledigt("identifiziert")) {
    return {
      ok: false,
      hinweis: "Bitte schließen Sie zuerst die Identifizierung ab.",
    };
  }

  /*
   * § 38 FZV: Die Vollmacht für einen Antrag über die Großkundenschnittstelle
   * braucht eine qualifizierte elektronische Signatur (natürliche Person) bzw.
   * ein qualifiziertes elektronisches Siegel (juristische Person). Ohne diese
   * Signatur darf der Antrag nicht raus.
   */
  const signatur = order.vollmacht?.signatur;
  if (!signatur || signatur.status !== "signiert") {
    return {
      ok: false,
      hinweis:
        "Die Vollmacht ist noch nicht qualifiziert elektronisch signiert. Ohne diese Signatur darf der Antrag nicht eingereicht werden.",
    };
  }

  /*
   * Sicherheitsriegel: Eine simulierte Signatur darf niemals in einen echten
   * Behördenvorgang laufen. Sonst wäre die Vollmacht rechtlich wertlos.
   */
  if (signatur.simuliert && getIkfzProvider().liveBetrieb) {
    return {
      ok: false,
      hinweis:
        "Der Zulassungsweg ist produktiv, die Signatur stammt aber aus dem Testbetrieb. Bitte SIGNATURE_PROVIDER auf einen qualifizierten Vertrauensdiensteanbieter umstellen.",
    };
  }

  if (order.ikfz.bescheid) {
    return { ok: true, hinweis: "Der Bescheid liegt bereits vor.", order };
  }

  const antrag: IkfzAntrag = {
    auftragId: order.id,
    vorgang: order.service === "kfz-ummeldung" ? "umschreibung" : "neuzulassung",
    halter: {
      istFirma: feld(order.payload, ["holder", "salutation"]) === "firma",
      firma: feld(order.payload, ["holder", "company"]),
      vorname: feld(order.payload, ["holder", "firstName"]) ?? "",
      nachname: feld(order.payload, ["holder", "lastName"]) ?? "",
      geburtsdatum: feld(order.payload, ["holder", "birthDate"]),
      geburtsort: feld(order.payload, ["holder", "birthPlace"]),
      strasse: feld(order.payload, ["holder", "street"]) ?? "",
      plz: feld(order.payload, ["holder", "zip"]) ?? "",
      ort: feld(order.payload, ["holder", "city"]) ?? "",
      email: order.email,
      telefon: feld(order.payload, ["holder", "phone"]) ?? "",
    },
    fahrzeug: {
      fin: feld(order.payload, ["vehicle", "vin"]) ?? "",
      sicherheitscodeZb2: feld(order.payload, ["ikfz", "sicherheitscodeZb2"]),
      sicherheitscodeZb1: feld(order.payload, ["ikfz", "sicherheitscodeZb1"]),
      zb1AusgestelltAm: feld(order.payload, ["ikfz", "zb1AusgestelltAm"]),
      zb2AusgestelltAm: feld(order.payload, ["ikfz", "zb2AusgestelltAm"]),
      huGueltigBis: feld(order.payload, ["vehicle", "huUntil"]),
      bisherigesKennzeichen: feld(order.payload, ["vehicle", "previousPlate"]),
    },
    kennzeichen: {
      unterscheidungszeichen: feld(order.payload, ["plate", "district"]) ?? "",
      buchstaben: feld(order.payload, ["plate", "letters"]) ?? "",
      zahlen: feld(order.payload, ["plate", "numbers"]) ?? "",
    },
    evb: feld(order.payload, ["insurance", "evb"]) ?? "",
    iban: feld(order.payload, ["sepa", "iban"]) ?? "",
    identVerfahren: order.ikfz.identVerfahren,
    schilderVorhanden: true,
    gebuehrenCent: order.totalCents,
    vollmacht: order.vollmacht ?? {
      textVersion: VOLLMACHT_VERSION,
      textHash: vollmachtHash(),
      unterschrift: feld(order.payload, ["documents", "signature"]) ?? "",
      erteiltAm: order.createdAt,
    },
    qesSignaturId: signatur.signaturId,
  };

  let antwort;
  try {
    antwort = await getIkfzProvider().einreichen(antrag);
  } catch (fehler) {
    if (fehler instanceof IkfzFehler) {
      // Technische Störungen dürfen den Auftrag nicht verbrennen – er bleibt
      // einreichbar, damit ein erneuter Versuch möglich ist.
      return {
        ok: false,
        hinweis:
          fehler.art === "technisch"
            ? `${fehler.message} Wir versuchen es automatisch erneut.`
            : fehler.message,
        order,
      };
    }
    throw fehler;
  }

  if (antwort.status === "abgelehnt") {
    await updateOrder(orderId, {
      ikfz: {
        ...order.ikfz,
        antragId: antwort.antragId,
        antragStatus: antwort.status,
        hinweis: antwort.hinweis,
      },
    });
    return {
      ok: false,
      hinweis:
        antwort.hinweis ??
        "Die Behörde hat den Antrag abgelehnt. Wir melden uns mit den nächsten Schritten.",
    };
  }

  const aktualisiert = await uebernehmeAntwort(orderId, antwort);

  return {
    ok: antwort.status === "bewilligt",
    hinweis:
      antwort.hinweis ??
      antwort.fehler?.join(" ") ??
      (antwort.wartetAufRueckruf
        ? "Der Antrag liegt bei der Behörde. Sobald die Entscheidung da ist, melden wir uns."
        : ""),
    order: aktualisiert,
  };
}

/**
 * Übernimmt eine Provider-Antwort in den Auftrag.
 *
 * Wird sowohl nach dem synchronen Einreichen als auch beim asynchronen
 * Rückruf des Zulassungspartners aufgerufen. Die Benachrichtigung geht genau
 * einmal raus – entscheidend ist, ob der Schritt schon in der Zeitleiste steht.
 */
export async function uebernehmeAntwort(
  orderId: string,
  antwort: IkfzAntwort,
): Promise<StoredOrder | null> {
  const order = await getOrder(orderId);
  if (!order?.ikfz) return null;

  const bescheidWarSchonDa = order.timeline.some((t) => t.key === "bescheid_erteilt");

  let timeline = withTimeline(order.timeline, "antrag_eingereicht");
  if (antwort.status === "bewilligt" && antwort.bescheid) {
    timeline = withTimeline(
      timeline,
      "bescheid_erteilt",
      `Aktenzeichen ${antwort.bescheid.bescheidId}`,
    );
  }

  const aktualisiert = await updateOrder(orderId, {
    timeline,
    ikfz: {
      ...order.ikfz,
      antragId: antwort.antragId,
      antragStatus: antwort.status,
      bescheid: antwort.bescheid ?? order.ikfz.bescheid,
      hinweis: antwort.hinweis,
    },
  });

  /*
   * Die vom Partner gelieferte Frist gegen § 31 FZV prüfen. Der angezeigte
   * Countdown steuert, wie lange Kundinnen und Kunden fahren – ein falscher
   * Wert darf nicht unbemerkt durchlaufen.
   */
  if (antwort.bescheid?.gueltigBis && antwort.bescheid.erlassenAm) {
    const frist = pruefeFahrfrist(antwort.bescheid.erlassenAm, antwort.bescheid.gueltigBis);
    if (!frist.plausibel) {
      console.warn(`[fahrfrist] Auftrag ${orderId}: ${frist.hinweis}`);
      await sendMail({
        to: notifyAddress,
        subject: `Prüfen: Fahrfrist bei Auftrag ${orderId} weicht ab`,
        text: [
          frist.hinweis ?? "Abweichende Fristangabe.",
          "",
          `Auftrag: ${orderId}`,
          `Erlassen am: ${antwort.bescheid.erlassenAm}`,
          `Gültig bis: ${antwort.bescheid.gueltigBis}`,
          `Errechnete Dauer: ${frist.tage} Tage`,
        ].join("\n"),
      });
    }
  }

  if (!bescheidWarSchonDa && antwort.status === "bewilligt" && antwort.bescheid) {
    const gueltigBis = antwort.bescheid.gueltigBis
      ? new Date(antwort.bescheid.gueltigBis).toLocaleDateString("de-DE")
      : "mit Ablauf der gesetzlichen Frist";

    await sendMail({
      to: order.email,
      subject: `Zulassung erteilt – ${antwort.bescheid.kennzeichen} ist auf Sie zugelassen`,
      text: [
        "Guten Tag,",
        "",
        `Ihr Fahrzeug ist unter dem Kennzeichen ${antwort.bescheid.kennzeichen} zugelassen.`,
        "",
        "WICHTIG – bitte jetzt erledigen:",
        "1. Vorläufigen Zulassungsnachweis herunterladen und ausdrucken.",
        "2. Kennzeichenschilder montieren (in dieser Zeit noch ohne Plaketten zulässig).",
        "3. Nachweis gut sichtbar im Fahrzeug anbringen, Zulassungsbescheid mitführen.",
        "",
        `Die Fahrberechtigung endet am ${gueltigBis}.`,
        "Bis dahin sind Zulassungsbescheinigung und Plaketten bei Ihnen; bringen Sie",
        "die Plaketten nach Erhalt unverzüglich an.",
        "",
        `Unterlagen: ${baseUrl()}/auftrag/${order.id}?code=${order.accessToken}`,
        "",
        `Ihr Team von ${site.name}`,
      ].join("\n"),
    });
  }

  return aktualisiert;
}

/** Markiert den Bescheid als abgerufen (Abruffenster). */
export async function bescheidAbgerufen(orderId: string) {
  const order = await getOrder(orderId);
  if (!order?.ikfz?.bescheid) return null;

  return updateOrder(orderId, {
    timeline: withTimeline(order.timeline, "bescheid_abgerufen"),
    ikfz: {
      ...order.ikfz,
      bescheid: {
        ...order.ikfz.bescheid,
        abgerufenAm: order.ikfz.bescheid.abgerufenAm ?? new Date().toISOString(),
      },
    },
  });
}

/** Ist das Abruffenster des Bescheids noch offen? */
export function abrufFensterOffen(abrufBis: string): boolean {
  return Date.now() < new Date(abrufBis).getTime();
}
