import { getSpeicher } from "./storage";

/**
 * Ablage für Aufträge.
 *
 * Die eigentliche Speichertechnik steckt in storage.ts – lokal das
 * Dateisystem, im Betrieb eine Datenbank. Hier stehen nur die fachlichen
 * Zugriffe.
 */

/** Schlüssel eines Auftrags in der Ablage */
const auftragsSchluessel = (id: string) => `auftrag:${sanitize(id)}`;
/** Menge aller Auftragsnummern eines Autohauses */
const haendlerMenge = (dealerId: string) => `haendler:${sanitize(dealerId)}`;

export type OrderStatus =
  | "offen"
  | "bezahlt"
  | "in_bearbeitung"
  | "abgeschlossen"
  | "storniert";

/** Schritte der Auftragsverfolgung. Reihenfolge = Anzeigereihenfolge. */
export type TimelineKey =
  | "bestellt"
  | "bezahlt"
  | "kennzeichen_reserviert"
  | "schilder_produziert"
  | "schilder_versandt"
  | "schilder_zugestellt"
  | "identifiziert"
  | "vollmacht_signiert"
  | "antrag_eingereicht"
  | "bescheid_erteilt"
  | "bescheid_abgerufen"
  | "unterlagen_versandt"
  | "abgeschlossen";

export interface TimelineEntry {
  key: TimelineKey;
  at: string;
  note?: string;
}

export interface OrderIkfz {
  /** Sofortzulassung nach i-Kfz Stufe 4 gebucht */
  aktiv: boolean;
  identVerfahren: "eid" | "identanbieter" | "elster";
  identifiziertAm?: string;
  antragId?: string;
  antragStatus?: string;
  bescheid?: {
    bescheidId: string;
    behoerde: string;
    kennzeichen: string;
    erlassenAm: string;
    abrufBis: string;
    gueltigBis: string;
    abgerufenAm?: string;
    simuliert: boolean;
  };
  hinweis?: string;
}

export interface StoredOrder {
  id: string;
  /** Autohaus, über das der Vorgang hereinkam – leer bei Direktkunden */
  dealerId?: string;
  /** Kurzreferenz des Verkaufs, etwa Kommissionsnummer */
  dealerReferenz?: string;
  /** Vom Verkauf angelegt, Kundendaten noch offen */
  vomHaendlerAngelegt?: boolean;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  totalCents: number;
  service: string;
  email: string;
  payload: unknown;
  /** Nur die Nachweise – die Dateien selbst werden nicht abgelegt */
  files: { field: string; filename: string; size: number }[];
  paymentRef?: string;
  /** Zugriffscode für die Auftragsverfolgung ohne Kundenkonto */
  accessToken: string;
  /** Nachweis der erteilten Vollmacht (für die Zulassung auf Dritte) */
  vollmacht?: {
    textVersion: string;
    textHash: string;
    unterschrift: string;
    erteiltAm: string;
    ip?: string;
    userAgent?: string;
    /** Ergebnis der qualifizierten elektronischen Signatur (§ 38 FZV) */
    signatur?: {
      signaturId: string;
      art: "qes" | "siegel";
      status: string;
      signiertAm?: string;
      pruefung?: string;
      provider: string;
      /** true = Testbetrieb, rechtlich nicht verwendbar */
      simuliert: boolean;
    };
  };
  timeline: TimelineEntry[];
  ikfz?: OrderIkfz;
  /** Ausgeführte Erstattungen – Nachweis für Buchhaltung und Rückfragen */
  erstattungen?: {
    betragCent: number;
    grund: string;
    notiz?: string;
    referenz: string;
    ausgeloestVon: string;
    am: string;
  }[];
}

/** Fügt einen Schritt zur Auftragsverfolgung hinzu, sofern er noch fehlt. */
export function withTimeline(
  timeline: TimelineEntry[],
  key: TimelineKey,
  note?: string,
): TimelineEntry[] {
  if (timeline.some((t) => t.key === key)) return timeline;
  return [...timeline, { key, at: new Date().toISOString(), note }];
}

export async function saveOrder(order: StoredOrder): Promise<void> {
  const speicher = getSpeicher();
  await speicher.schreib(auftragsSchluessel(order.id), order);

  /* Index je Autohaus, damit die Übersicht ohne vollen Durchlauf auskommt. */
  if (order.dealerId) {
    await speicher.mengeErgaenzen(haendlerMenge(order.dealerId), order.id);
  }
}

/** Alle Aufträge eines Autohauses, neueste zuerst. */
export async function listOrdersByDealer(dealerId: string): Promise<StoredOrder[]> {
  const speicher = getSpeicher();
  const nummern = await speicher.mengeLesen(haendlerMenge(dealerId));

  const geladen = await Promise.all(
    nummern.map((nummer) => speicher.lies<StoredOrder>(auftragsSchluessel(nummer))),
  );

  return geladen
    .filter((o): o is StoredOrder => Boolean(o))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<StoredOrder | null> {
  return getSpeicher().lies<StoredOrder>(auftragsSchluessel(id));
}

export async function updateOrder(
  id: string,
  patch: Partial<StoredOrder>,
): Promise<StoredOrder | null> {
  const existing = await getOrder(id);
  if (!existing) return null;
  const updated: StoredOrder = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await saveOrder(updated);
  return updated;
}

export interface HochgeladeneDatei {
  field: string;
  filename: string;
  size: number;
  contentType: string;
  inhalt: Buffer;
}

/**
 * Nimmt eine hochgeladene Datei entgegen, ohne sie abzulegen.
 *
 * Die Dokumente gehen als Anhang an die Sachbearbeitung und werden nicht
 * gespeichert. Das ist bewusst so: Ausweis- und Fahrzeugpapiere sind das
 * Heikelste am ganzen Vorgang, und was nicht liegt, kann nicht abfließen.
 * Wer sie dauerhaft braucht, bindet hier einen Objektspeicher an (S3 o. Ä.)
 * und trägt die Aufbewahrungsfrist in die Datenschutzerklärung ein.
 */
export async function readUpload(field: string, file: File): Promise<HochgeladeneDatei> {
  return {
    field,
    filename: file.name,
    size: file.size,
    contentType: file.type || "application/octet-stream",
    inhalt: Buffer.from(await file.arrayBuffer()),
  };
}

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}
