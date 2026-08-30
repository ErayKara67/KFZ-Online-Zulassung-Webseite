import type { IkfzVorgang } from "./types";

/**
 * Vorprüfung, ob ein Vorgang über i-Kfz Stufe 4 mit sofortiger
 * Inbetriebsetzung abgewickelt werden kann.
 *
 * Die Stichtage ergeben sich aus den Sicherheitscodes auf den
 * Fahrzeugdokumenten: erst ab diesen Ausstellungsdaten tragen die
 * Papiere die verdeckten Codes, die das Verfahren benötigt.
 */
export const STICHTAG_ZB1 = "2015-01-01";
export const STICHTAG_ZB2 = "2018-01-01";

/**
 * Dauer der Fahrberechtigung ohne Stempelplaketten.
 *
 * § 31 FZV: höchstens vierzehn Tage. Die Frist beginnt mit dem Abruf der
 * automatisierten Entscheidung – nicht mit der Bestellung und nicht mit der
 * Zustellung der Schilder.
 *
 * Achtung: Bis Ende 2025 galten zehn Tage. Wer ältere Quellen zitiert, rechnet
 * zu kurz.
 */
export const NACHWEIS_GUELTIGKEIT_TAGE = 14;

/**
 * Zeitfenster, in dem die automatisierte Entscheidung abgerufen werden muss.
 *
 * Ergibt sich nicht aus der FZV, sondern aus der technischen Vorgabe des
 * jeweiligen Portals bzw. des Zulassungspartners. Wert beim Partner erfragen
 * und hier anpassen.
 */
export const ABRUFFENSTER_MINUTEN = Number(
  process.env.IKFZ_ABRUFFENSTER_MINUTEN ?? 30,
);

/**
 * Prüft, ob die vom Partner gelieferte Frist zur Rechtslage passt.
 *
 * Hintergrund: § 31 FZV wurde Ende 2025 von zehn auf vierzehn Tage geändert.
 * Etliche Anbieter- und Behördentexte nennen weiterhin zehn Tage. Da das
 * Portal den gelieferten Wert als Countdown anzeigt, würde ein veralteter
 * Wert Kundinnen und Kunden dazu bringen, das Fahrzeug zu früh stehen zu
 * lassen. Deshalb wird jede Abweichung protokolliert statt stillschweigend
 * übernommen.
 */
export function pruefeFahrfrist(
  erlassenAm: string,
  gueltigBis: string,
): { plausibel: boolean; tage: number; hinweis?: string } {
  const start = new Date(erlassenAm);
  const ende = new Date(gueltigBis);

  if (Number.isNaN(start.getTime()) || Number.isNaN(ende.getTime())) {
    return { plausibel: false, tage: 0, hinweis: "Fristangabe des Partners ist unlesbar." };
  }

  const tage =
    Math.round((ende.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / 86_400_000) + 1;

  if (tage === NACHWEIS_GUELTIGKEIT_TAGE) return { plausibel: true, tage };

  if (tage < NACHWEIS_GUELTIGKEIT_TAGE) {
    return {
      plausibel: false,
      tage,
      hinweis:
        `Der Partner liefert eine Fahrberechtigung über ${tage} Tage. ` +
        `§ 31 FZV erlaubt bis zu ${NACHWEIS_GUELTIGKEIT_TAGE}. Bitte beim Partner klären – ` +
        "möglicherweise rechnet dessen System noch nach der alten Fassung.",
    };
  }

  return {
    plausibel: false,
    tage,
    hinweis:
      `Der Partner liefert eine Fahrberechtigung über ${tage} Tage, mehr als die ` +
      `${NACHWEIS_GUELTIGKEIT_TAGE} Tage aus § 31 FZV. Bitte prüfen.`,
  };
}

export type PruefStatus = "erfuellt" | "offen" | "ausgeschlossen";

export interface PruefPunkt {
  key: string;
  label: string;
  status: PruefStatus;
  hinweis: string;
}

export interface EligibilityInput {
  vorgang: IkfzVorgang;
  zb1AusgestelltAm?: string;
  zb2AusgestelltAm?: string;
  sicherheitscodeZb1?: string;
  sicherheitscodeZb2?: string;
  huGueltigBis?: string;
  evb?: string;
  iban?: string;
  identVerfahren?: string;
  istFirma?: boolean;
  schilderVorhanden?: boolean;
  /** Sonderkennzeichen wie Kurzzeit-, Ausfuhr- oder rote Kennzeichen */
  sonderkennzeichen?: boolean;
}

export interface EligibilityResult {
  moeglich: boolean;
  punkte: PruefPunkt[];
  offeneSchritte: number;
  ausschluesse: string[];
}

function nachStichtag(datum: string | undefined, stichtag: string): boolean {
  if (!datum) return false;
  return datum >= stichtag;
}

function huGueltig(huGueltigBis: string | undefined): boolean {
  if (!huGueltigBis) return false;
  // Format YYYY-MM; gültig bis zum Ende des angegebenen Monats
  const heute = new Date();
  const aktuell = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, "0")}`;
  return huGueltigBis >= aktuell;
}

export function pruefeEligibility(input: EligibilityInput): EligibilityResult {
  const punkte: PruefPunkt[] = [];
  const ausschluesse: string[] = [];

  /* --- Vorgangsart ------------------------------------------------------ */
  if (input.sonderkennzeichen) {
    ausschluesse.push(
      "Kurzzeit-, Ausfuhr- und rote Kennzeichen sind vom i-Kfz-Verfahren ausgenommen.",
    );
    punkte.push({
      key: "vorgang",
      label: "Vorgangsart",
      status: "ausgeschlossen",
      hinweis:
        "Für Sonderkennzeichen ist der Weg über die Zulassungsstelle erforderlich. Wir übernehmen den Vorgang klassisch mit Vollmacht.",
    });
  } else {
    punkte.push({
      key: "vorgang",
      label: "Vorgangsart",
      status: "erfuellt",
      hinweis: "Dieser Vorgang ist über i-Kfz Stufe 4 abbildbar.",
    });
  }

  /* --- Fahrzeugpapiere -------------------------------------------------- */
  const brauchtZb2 =
    input.vorgang === "neuzulassung" ||
    input.vorgang === "wiederzulassung" ||
    input.vorgang === "halterwechsel" ||
    input.vorgang === "umschreibung";

  if (brauchtZb2) {
    const ok =
      nachStichtag(input.zb2AusgestelltAm, STICHTAG_ZB2) &&
      Boolean(input.sicherheitscodeZb2);
    punkte.push({
      key: "zb2",
      label: "Zulassungsbescheinigung Teil II",
      status: input.zb2AusgestelltAm && !nachStichtag(input.zb2AusgestelltAm, STICHTAG_ZB2)
        ? "ausgeschlossen"
        : ok
          ? "erfuellt"
          : "offen",
      hinweis: ok
        ? "Sicherheitscode liegt vor."
        : input.zb2AusgestelltAm && !nachStichtag(input.zb2AusgestelltAm, STICHTAG_ZB2)
          ? "Teil II wurde vor dem 01.01.2018 ausgestellt und trägt keinen Sicherheitscode. Sofortzulassung ist nicht möglich."
          : "Bitte das verdeckte Feld auf Teil II freilegen und den Code eintragen.",
    });
    if (input.zb2AusgestelltAm && !nachStichtag(input.zb2AusgestelltAm, STICHTAG_ZB2)) {
      ausschluesse.push("Zulassungsbescheinigung Teil II ohne Sicherheitscode.");
    }
  }

  const brauchtZb1 =
    input.vorgang === "umschreibung" ||
    input.vorgang === "halterwechsel" ||
    input.vorgang === "adressaenderung" ||
    input.vorgang === "wiederzulassung";

  if (brauchtZb1) {
    const ok =
      nachStichtag(input.zb1AusgestelltAm, STICHTAG_ZB1) &&
      Boolean(input.sicherheitscodeZb1);
    punkte.push({
      key: "zb1",
      label: "Zulassungsbescheinigung Teil I",
      status: input.zb1AusgestelltAm && !nachStichtag(input.zb1AusgestelltAm, STICHTAG_ZB1)
        ? "ausgeschlossen"
        : ok
          ? "erfuellt"
          : "offen",
      hinweis: ok
        ? "Sicherheitscode liegt vor."
        : input.zb1AusgestelltAm && !nachStichtag(input.zb1AusgestelltAm, STICHTAG_ZB1)
          ? "Teil I wurde vor dem 01.01.2015 ausgestellt und trägt keinen Sicherheitscode. Sofortzulassung ist nicht möglich."
          : "Bitte das verdeckte Feld auf Teil I freilegen und den Code eintragen.",
    });
    if (input.zb1AusgestelltAm && !nachStichtag(input.zb1AusgestelltAm, STICHTAG_ZB1)) {
      ausschluesse.push("Zulassungsbescheinigung Teil I ohne Sicherheitscode.");
    }
  }

  /* --- Hauptuntersuchung ------------------------------------------------ */
  if (input.vorgang !== "adressaenderung" && input.vorgang !== "ausserbetriebsetzung") {
    const ok = huGueltig(input.huGueltigBis);
    punkte.push({
      key: "hu",
      label: "Hauptuntersuchung",
      status: ok ? "erfuellt" : "offen",
      hinweis: ok
        ? "Gültige HU hinterlegt."
        : "Bitte das Datum der gültigen Hauptuntersuchung angeben. Eine abgelaufene HU schließt die Zulassung aus.",
    });
  }

  /* --- Versicherung und Steuer ------------------------------------------ */
  if (input.vorgang !== "ausserbetriebsetzung") {
    punkte.push({
      key: "evb",
      label: "eVB-Nummer",
      status: input.evb && input.evb.length === 7 ? "erfuellt" : "offen",
      hinweis:
        input.evb && input.evb.length === 7
          ? "Versicherungsbestätigung liegt vor."
          : "Die siebenstellige eVB-Nummer erhalten Sie kostenlos von Ihrer Kfz-Versicherung.",
    });

    punkte.push({
      key: "sepa",
      label: "SEPA-Mandat für die Kfz-Steuer",
      status: input.iban && input.iban.replace(/\s/g, "").length >= 15 ? "erfuellt" : "offen",
      hinweis:
        input.iban && input.iban.replace(/\s/g, "").length >= 15
          ? "Lastschriftmandat liegt vor."
          : "Ohne SEPA-Mandat für den Einzug der Kfz-Steuer ist keine Zulassung möglich.",
    });
  }

  /* --- Identifizierung -------------------------------------------------- */
  const identOk = Boolean(input.identVerfahren);
  punkte.push({
    key: "ident",
    label: "Identifizierung",
    status: identOk ? "erfuellt" : "offen",
    hinweis: input.istFirma
      ? "Für Firmen erfolgt die Identifizierung über das ELSTER-Unternehmenskonto."
      : identOk
        ? "Verfahren gewählt. Die Identifizierung findet nach der Bestellung statt."
        : "Online-Ausweisfunktion mit PIN oder Identifizierung über einen Vertrauensdiensteanbieter.",
  });

  /* --- Schilderlogistik ------------------------------------------------- */
  if (input.vorgang !== "adressaenderung" && input.vorgang !== "ausserbetriebsetzung") {
    punkte.push({
      key: "schilder",
      label: "Kennzeichenschilder",
      status: input.schilderVorhanden ? "erfuellt" : "offen",
      hinweis: input.schilderVorhanden
        ? "Schilder liegen vor bzw. werden vorab geliefert."
        : "Losfahren ist nur mit montierten Schildern erlaubt. Wir liefern sie vor dem Zulassungsantrag per Express.",
    });
  }

  const offeneSchritte = punkte.filter((p) => p.status === "offen").length;
  const moeglich = ausschluesse.length === 0 && offeneSchritte === 0;

  return { moeglich, punkte, offeneSchritte, ausschluesse };
}
