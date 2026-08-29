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

export type OrderStatus = "offen" | "bezahlt" | "in_bearbeitung" | "abgeschlossen" | "storniert";

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
}

async function ensureDirs() {
  await fs.mkdir(ORDER_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
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
