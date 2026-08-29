import {
  statusZuordnung,
  toPartnerRequest,
  type PartnerAntwortRaw,
} from "./partner-mapping";
import {
  IkfzFehler,
  type DokumentArt,
  type IkfzAntrag,
  type IkfzAntragStatus,
  type IkfzAntwort,
  type IkfzDokument,
  type IkfzProvider,
} from "./types";

/**
 * Adapter für einen bestehenden Teilnehmer der Großkundenschnittstelle, der
 * die Zulassung im Auftrag durchführt.
 *
 * Dieser Weg braucht kein eigenes Mindestvolumen und keine eigene
 * KBA-Registrierung. Der Partner tritt mit der von der Kundin bzw. dem Kunden
 * erteilten Vollmacht gegenüber der Behörde auf.
 *
 * Konfiguration über IKFZ_PARTNER_URL und IKFZ_PARTNER_TOKEN.
 * Die Feldnamen der Nutzdaten stehen in partner-mapping.ts.
 */

const TIMEOUT_MS = Number(process.env.IKFZ_PARTNER_TIMEOUT_MS ?? 45_000);
const VERSUCHE = 3;

function konfiguration() {
  const basis = process.env.IKFZ_PARTNER_URL;
  const token = process.env.IKFZ_PARTNER_TOKEN;
  if (!basis || !token) {
    throw new IkfzFehler(
      "IKFZ_PARTNER_URL oder IKFZ_PARTNER_TOKEN fehlt. Siehe .env.example.",
      "konfiguration",
    );
  }
  return { basis: basis.replace(/\/+$/, ""), token };
}

function warte(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface AnfrageOptionen {
  methode?: "GET" | "POST";
  body?: unknown;
  /** Verhindert Doppelzulassungen bei Wiederholungen */
  idempotenzSchluessel?: string;
  roh?: boolean;
}

async function anfrage(pfad: string, optionen: AnfrageOptionen = {}): Promise<Response> {
  const { basis, token } = konfiguration();
  const { methode = "POST", body, idempotenzSchluessel, roh } = optionen;

  let letzterFehler: unknown;

  for (let versuch = 1; versuch <= VERSUCHE; versuch += 1) {
    try {
      const res = await fetch(`${basis}${pfad}`, {
        method: methode,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: roh ? "application/pdf" : "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(idempotenzSchluessel ? { "Idempotency-Key": idempotenzSchluessel } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      /* 4xx sind fachliche Antworten – eine Wiederholung ändert nichts. */
      if (res.status >= 400 && res.status < 500) {
        const text = await res.text().catch(() => "");
        throw new IkfzFehler(
          deuteFehlertext(res.status, text),
          res.status === 401 || res.status === 403 ? "konfiguration" : "fachlich",
        );
      }

      if (res.status >= 500) {
        throw new IkfzFehler(
          `Der Zulassungspartner meldet eine Störung (HTTP ${res.status}).`,
          "technisch",
          true,
        );
      }

      return res;
    } catch (fehler) {
      letzterFehler = fehler;

      const wiederholbar =
        fehler instanceof IkfzFehler
          ? fehler.wiederholbar
          : fehler instanceof Error &&
            (fehler.name === "TimeoutError" || fehler.name === "AbortError" ||
              fehler.message.includes("fetch"));

      if (!wiederholbar || versuch === VERSUCHE) break;
      await warte(500 * 2 ** (versuch - 1));
    }
  }

  if (letzterFehler instanceof IkfzFehler) throw letzterFehler;
  throw new IkfzFehler(
    "Der Zulassungspartner ist derzeit nicht erreichbar. Der Auftrag bleibt gespeichert, wir versuchen es erneut.",
    "technisch",
    true,
  );
}

function deuteFehlertext(status: number, text: string): string {
  if (status === 401 || status === 403) {
    return "Zugangsdaten für den Zulassungspartner werden abgelehnt.";
  }
  if (status === 409) {
    return "Für diesen Auftrag liegt beim Partner bereits ein Vorgang vor.";
  }
  try {
    const json = JSON.parse(text) as { message?: string; errors?: string[] };
    return json.message ?? json.errors?.join(" ") ?? `Antrag abgelehnt (HTTP ${status}).`;
  } catch {
    return text.slice(0, 300) || `Antrag abgelehnt (HTTP ${status}).`;
  }
}

function zuAntwort(roh: PartnerAntwortRaw, fallbackId: string): IkfzAntwort {
  const status = (statusZuordnung[roh.state ?? ""] ?? "eingereicht") as IkfzAntragStatus;
  const entscheidung = roh.decision;

  return {
    status,
    antragId: roh.id ?? roh.externalId ?? fallbackId,
    hinweis: roh.message,
    fehler: roh.errors,
    wartetAufRueckruf: status === "eingereicht" && !entscheidung,
    bescheid:
      entscheidung && entscheidung.fileNumber
        ? {
            bescheidId: entscheidung.fileNumber,
            behoerde: entscheidung.authority ?? "Zulassungsbehörde",
            kennzeichen: entscheidung.plate ?? "",
            erlassenAm: entscheidung.issuedAt ?? new Date().toISOString(),
            abrufBis:
              entscheidung.retrievableUntil ??
              new Date(Date.now() + 30 * 60_000).toISOString(),
            gueltigBis: entscheidung.validUntil ?? "",
            simuliert: false,
          }
        : undefined,
  };
}

export const partnerProvider: IkfzProvider = {
  name: "GKS-Partner",
  liveBetrieb: true,

  async einreichen(antrag: IkfzAntrag): Promise<IkfzAntwort> {
    const res = await anfrage("/antraege", {
      body: toPartnerRequest(antrag),
      // Gleiche Auftragsnummer = gleicher Vorgang, auch bei Wiederholung
      idempotenzSchluessel: antrag.auftragId,
    });
    const roh = (await res.json()) as PartnerAntwortRaw;
    return zuAntwort(roh, antrag.auftragId);
  },

  async bescheidAbrufen(antragId: string): Promise<IkfzAntwort> {
    const res = await anfrage(`/antraege/${encodeURIComponent(antragId)}`, {
      methode: "GET",
    });
    const roh = (await res.json()) as PartnerAntwortRaw;
    return zuAntwort(roh, antragId);
  },

  async dokument(antragId: string, art: DokumentArt): Promise<IkfzDokument> {
    /*
     * Die Datei wird über unseren Server geholt und weitergereicht, damit die
     * Kundin bzw. der Kunde nie die URL und den Token des Partners sieht.
     */
    const schluessel = art === "nachweis" ? "provisional-certificate" : "decision";
    const res = await anfrage(
      `/antraege/${encodeURIComponent(antragId)}/dokumente/${schluessel}`,
      { methode: "GET", roh: true },
    );

    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength === 0) {
      throw new IkfzFehler(
        "Der Zulassungspartner hat kein Dokument geliefert.",
        "technisch",
        true,
      );
    }

    return {
      bytes,
      contentType: res.headers.get("Content-Type") ?? "application/pdf",
      dateiname:
        art === "nachweis"
          ? `vorlaeufiger-zulassungsnachweis-${antragId}.pdf`
          : `zulassungsbescheid-${antragId}.pdf`,
    };
  },
};
