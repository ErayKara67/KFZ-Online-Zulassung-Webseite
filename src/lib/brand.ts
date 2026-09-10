/**
 * Markenkonfiguration – die einzige Datei, die geändert werden muss, um das
 * Portal unter der Marke eines Autohauses zu betreiben.
 *
 * Farben, Name, Logo-Kürzel und Ansprache liegen hier zusammen. Der Rest der
 * Anwendung greift ausschließlich über CSS-Variablen und diese Werte darauf
 * zu – es gibt keine fest verdrahtete Farbe in einer Komponente.
 */

export const brand = {
  /** Anzeigename in Kopfzeile, Fußzeile und E-Mails */
  name: "Autohaus Nordstern",
  /** Zweizeiliges Kürzel für das Logofeld, 2 Zeichen */
  monogram: "AN",
  /** Zeile unter dem Namen */
  tagline: "Zulassungsservice",
  /** Wie der Betrieb sich selbst nennt: „Autohaus", „Autozentrum", … */
  betriebsart: "Autohaus",

  /**
   * Akzentfarbe. Wird als CSS-Variable gesetzt und überall verwendet.
   * Ein Markenwechsel ist eine Änderung an diesen drei Werten.
   */
  accent: {
    /** Grundton für Flächen und Knöpfe */
    base: "#d2703a",
    /** Aufgehellt für Text und Linien auf dunklem Grund */
    bright: "#ef9257",
    /** Abgedunkelt für gedrückte Zustände */
    deep: "#a8542a",
  },

  /** Kennzeichen-Kürzel des Heimatbezirks – wird im Prüfer vorbelegt */
  heimatkuerzel: "HER",
} as const;

export type Brand = typeof brand;
