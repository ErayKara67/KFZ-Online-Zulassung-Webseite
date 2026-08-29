/**
 * Datenmodell für die internetbasierte Fahrzeugzulassung (i-Kfz, Stufe 4).
 *
 * Rechtlicher Rahmen: FZV. Stufe 4 erlaubt die sofortige Inbetriebsetzung
 * über einen vorläufigen Zulassungsnachweis mit einer Gültigkeit von
 * 10 Kalendertagen. Der automatisierte Zulassungsbescheid muss innerhalb
 * eines kurzen Zeitfensters (30 Minuten) abgerufen werden.
 */

export type IkfzVorgang =
  | "neuzulassung"
  | "wiederzulassung"
  | "umschreibung"
  | "halterwechsel"
  | "adressaenderung"
  | "ausserbetriebsetzung";

export type IdentVerfahren = "eid" | "identanbieter" | "elster";

export interface IkfzHalter {
  istFirma: boolean;
  firma?: string;
  vorname: string;
  nachname: string;
  geburtsdatum?: string;
  geburtsort?: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
  telefon: string;
}

export interface IkfzFahrzeug {
  fin: string;
  /** Sicherheitscode der Zulassungsbescheinigung Teil II (verdecktes Feld) */
  sicherheitscodeZb2?: string;
  /** Sicherheitscode der Zulassungsbescheinigung Teil I (verdecktes Feld) */
  sicherheitscodeZb1?: string;
  /** Ausstellungsdatum ZB I – muss nach dem 01.01.2015 liegen */
  zb1AusgestelltAm?: string;
  /** Ausstellungsdatum ZB II – muss nach dem 01.01.2018 liegen */
  zb2AusgestelltAm?: string;
  /** Gültigkeit der Hauptuntersuchung, Format YYYY-MM */
  huGueltigBis?: string;
  bisherigesKennzeichen?: string;
}

export interface IkfzKennzeichen {
  unterscheidungszeichen: string;
  buchstaben: string;
  zahlen: string;
  /** PIN der Wunschkennzeichen-Reservierung, sofern vorhanden */
  reservierungsPin?: string;
}

/**
 * Nachweis der erteilten Vollmacht.
 *
 * Bei der Zulassung auf Dritte über die Großkundenschnittstelle muss die
 * Bevollmächtigung digital abgebildet und nachweisbar sein. Manche Partner
 * verlangen zusätzlich eine qualifizierte elektronische Signatur (QES) –
 * dann wird `qesReferenz` mit der Referenz des Signaturdienstes gefüllt.
 */
export interface IkfzVollmacht {
  /** Version des zugestimmten Vollmachtstextes, z. B. "2026-01" */
  textVersion: string;
  /** Hash des Textes, dem tatsächlich zugestimmt wurde */
  textHash: string;
  /** Getippte Unterschrift der Halterin bzw. des Halters */
  unterschrift: string;
  erteiltAm: string;
  ip?: string;
  userAgent?: string;
  qesReferenz?: string;
}

export interface IkfzAntrag {
  auftragId: string;
  vorgang: IkfzVorgang;
  halter: IkfzHalter;
  fahrzeug: IkfzFahrzeug;
  kennzeichen: IkfzKennzeichen;
  evb: string;
  iban: string;
  identVerfahren: IdentVerfahren;
  /** Bestätigung, dass die Schilder beim Halter sind und montiert werden */
  schilderVorhanden: boolean;
  gebuehrenCent: number;
  vollmacht: IkfzVollmacht;
}

export interface IkfzBescheid {
  /** Aktenzeichen der Zulassungsbehörde bzw. des Providers */
  bescheidId: string;
  behoerde: string;
  kennzeichen: string;
  erlassenAm: string;
  /** Ende des Abruffensters – danach ist ein Neuabruf nötig */
  abrufBis: string;
  /** Ende der 10-tägigen Fahrberechtigung */
  gueltigBis: string;
  abgerufenAm?: string;
  /** true, solange der Nachweis aus dem Sandbox-Betrieb stammt */
  simuliert: boolean;
}

export type IkfzAntragStatus =
  | "vorbereitet"
  | "identifizierung_offen"
  | "eingereicht"
  | "bewilligt"
  | "abgelehnt";

export type DokumentArt = "nachweis" | "bescheid";

export interface IkfzDokument {
  bytes: Uint8Array;
  dateiname: string;
  contentType: string;
}

export interface IkfzAntwort {
  status: IkfzAntragStatus;
  antragId: string;
  bescheid?: IkfzBescheid;
  /** Klartextbegründung bei Ablehnung oder Rückfrage */
  hinweis?: string;
  fehler?: string[];
  /** true, wenn die Entscheidung asynchron per Rückruf nachgereicht wird */
  wartetAufRueckruf?: boolean;
}

/**
 * Unterscheidet fachliche Ablehnungen (Antrag erneut stellen sinnlos) von
 * technischen Störungen (Wiederholung sinnvoll). Die Oberfläche zeigt beides
 * unterschiedlich an.
 */
export class IkfzFehler extends Error {
  constructor(
    message: string,
    readonly art: "fachlich" | "technisch" | "konfiguration",
    readonly wiederholbar = false,
  ) {
    super(message);
    this.name = "IkfzFehler";
  }
}

/**
 * Schnittstelle, gegen die die Anwendung programmiert.
 * Alle Adapter (Sandbox, eigene GKS, GKS-Partner) erfüllen diesen Vertrag,
 * sodass ein Anbieterwechsel nur eine Umgebungsvariable ist.
 */
export interface IkfzProvider {
  readonly name: string;
  readonly liveBetrieb: boolean;
  einreichen(antrag: IkfzAntrag): Promise<IkfzAntwort>;
  bescheidAbrufen(antragId: string): Promise<IkfzAntwort>;
  /** Liefert Bescheid bzw. vorläufigen Zulassungsnachweis als Datei. */
  dokument(antragId: string, art: DokumentArt): Promise<IkfzDokument>;
}
