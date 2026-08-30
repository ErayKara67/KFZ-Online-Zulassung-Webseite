import { formatPrice } from "./services";

/**
 * Interne Kostenrechnung je Vorgang.
 *
 * Nach außen gilt ein Festpreis. Intern muss trotzdem jede Position einzeln
 * stehen – sonst weißt du am Monatsende nicht, ob ein Vorgang Geld verdient
 * oder kostet. Besonders die amtlichen Gebühren schwanken je Zulassungsbezirk;
 * sie sind im Festpreis enthalten, also trägst du die Differenz.
 */

export interface Kostenposition {
  schluessel: string;
  label: string;
  /** Betrag in Cent */
  betrag: number;
  quelle: "vertrag" | "schaetzung" | "ist";
  hinweis?: string;
}

/**
 * Bekannte Einkaufspreise. Stand: Angebot des Zulassungspartners.
 * Bei Vertragsänderungen hier nachziehen – die Zahlen landen in jeder
 * Auftragsauswertung.
 */
export const einkaufspreise = {
  /** Zulio Einsteigerplan, je Vorgang */
  partnerVorgang: 1390,
  /** Qualifizierte elektronische Signatur, je Vorgang */
  signatur: 390,
  /** PLATZHALTER – Angebot des Prägepartners eintragen */
  schilderPaar: 0,
  /** PLATZHALTER – Tarif des Versanddienstleisters eintragen */
  expressversand: 0,
  /** PLATZHALTER – amtliche Gebühren, je Bezirk verschieden */
  amtlicheGebuehren: 0,
  /** Anteil des Zahlungsdienstleisters am Bruttobetrag */
  zahlungsanteil: 0.019,
  /** Fixer Anteil des Zahlungsdienstleisters je Transaktion */
  zahlungFix: 25,
} as const;

export interface KostenEingabe {
  /** Bruttoerlös des Auftrags in Cent */
  erloesCent: number;
  sofortzulassung: boolean;
  mitSchildern: boolean;
  expressversand: boolean;
  /** Tatsächliche amtliche Gebühren, sobald bekannt */
  amtlicheGebuehrenCent?: number;
}

export interface Deckungsbeitrag {
  positionen: Kostenposition[];
  kostenCent: number;
  erloesCent: number;
  deckungsbeitragCent: number;
  /** null, solange Platzhalter in der Rechnung stehen */
  margeProzent: number | null;
  offenePositionen: string[];
}

export function berechneDeckungsbeitrag(eingabe: KostenEingabe): Deckungsbeitrag {
  const positionen: Kostenposition[] = [];
  const offene: string[] = [];

  const nimm = (
    schluessel: string,
    label: string,
    betrag: number,
    quelle: Kostenposition["quelle"],
    hinweis?: string,
  ) => {
    positionen.push({ schluessel, label, betrag, quelle, hinweis });
    if (betrag === 0 && quelle === "schaetzung") offene.push(label);
  };

  nimm("partner", "Zulassungspartner", einkaufspreise.partnerVorgang, "vertrag");

  if (eingabe.sofortzulassung) {
    nimm("signatur", "Qualifizierte Signatur", einkaufspreise.signatur, "vertrag");
  }

  const gebuehren = eingabe.amtlicheGebuehrenCent ?? einkaufspreise.amtlicheGebuehren;
  nimm(
    "gebuehren",
    "Amtliche Gebühren",
    gebuehren,
    eingabe.amtlicheGebuehrenCent !== undefined ? "ist" : "schaetzung",
    "Je Zulassungsbezirk verschieden",
  );

  if (eingabe.mitSchildern) {
    nimm("schilder", "Kennzeichenschilder", einkaufspreise.schilderPaar, "schaetzung");
  }

  if (eingabe.expressversand) {
    nimm("versand", "Expressversand", einkaufspreise.expressversand, "schaetzung");
  }

  const zahlung =
    Math.round(eingabe.erloesCent * einkaufspreise.zahlungsanteil) +
    einkaufspreise.zahlungFix;
  nimm("zahlung", "Zahlungsgebühren", zahlung, "schaetzung");

  const kostenCent = positionen.reduce((s, p) => s + p.betrag, 0);
  const deckungsbeitragCent = eingabe.erloesCent - kostenCent;

  return {
    positionen,
    kostenCent,
    erloesCent: eingabe.erloesCent,
    deckungsbeitragCent,
    margeProzent:
      offene.length > 0 || eingabe.erloesCent === 0
        ? null
        : Math.round((deckungsbeitragCent / eingabe.erloesCent) * 1000) / 10,
    offenePositionen: offene,
  };
}

/** Zeilenweise Darstellung für die interne Auftragsansicht und E-Mails. */
export function kostenAlsText(db: Deckungsbeitrag): string {
  const zeilen = db.positionen.map(
    (p) =>
      `  ${p.label.padEnd(26)} ${formatPrice(p.betrag).padStart(10)}` +
      (p.quelle === "schaetzung" && p.betrag === 0 ? "   << offen" : ""),
  );

  return [
    `  ${"Erlös".padEnd(26)} ${formatPrice(db.erloesCent).padStart(10)}`,
    ...zeilen,
    `  ${"Deckungsbeitrag".padEnd(26)} ${formatPrice(db.deckungsbeitragCent).padStart(10)}`,
    db.margeProzent === null
      ? `  Marge noch nicht berechenbar – offen: ${db.offenePositionen.join(", ")}`
      : `  Marge ${db.margeProzent} %`,
  ].join("\n");
}
