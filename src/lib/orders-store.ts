import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Einfache dateibasierte Ablage für Aufträge.
 *
 * Für den Produktivbetrieb sollte hier eine Datenbank angebunden werden
 * (z. B. PostgreSQL über Prisma). Die Schnittstelle unten bleibt dabei gleich –
 * es müssen nur die vier Funktionen ersetzt werden. Siehe README.
 */

const DATA_DIR = process.env.ORDER_DATA_DIR ?? path.join(process.cwd(), ".data");
const ORDER_DIR = path.join(DATA_DIR, "orders");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

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
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  totalCents: number;
  service: string;
  email: string;
  payload: unknown;
  files: { field: string; filename: string; size: number; storedAs: string }[];
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
}

async function ensureDirs() {
  await fs.mkdir(ORDER_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
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
  await ensureDirs();
  await fs.writeFile(
    path.join(ORDER_DIR, `${order.id}.json`),
    JSON.stringify(order, null, 2),
    "utf8",
  );
}

export async function getOrder(id: string): Promise<StoredOrder | null> {
  try {
    const raw = await fs.readFile(path.join(ORDER_DIR, `${sanitize(id)}.json`), "utf8");
    return JSON.parse(raw) as StoredOrder;
  } catch {
    return null;
  }
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

export async function storeUpload(
  orderId: string,
  field: string,
  file: File,
): Promise<{ field: string; filename: string; size: number; storedAs: string }> {
  await ensureDirs();
  const dir = path.join(UPLOAD_DIR, sanitize(orderId));
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.name).slice(0, 8).replace(/[^a-zA-Z0-9.]/g, "");
  const storedAs = path.join(dir, `${sanitize(field)}${ext || ""}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(storedAs, buffer);

  return { field, filename: file.name, size: file.size, storedAs };
}

function sanitize(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "");
}
