import { timingSafeEqual } from "node:crypto";
import { getOrder, type StoredOrder } from "./orders-store";

/** Vergleicht Zugriffscodes ohne Laufzeitunterschied. */
export function codeStimmt(erwartet: string, geliefert: string): boolean {
  const a = Buffer.from(erwartet);
  const b = Buffer.from(geliefert);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Lädt einen Auftrag nur, wenn der mitgelieferte Zugriffscode passt.
 * So ist die Auftragsverfolgung ohne Kundenkonto nutzbar, ohne dass sich
 * Auftragsnummern durchprobieren lassen.
 */
export async function auftragMitCode(
  id: string,
  code: string | null,
): Promise<StoredOrder | null> {
  if (!code) return null;
  const order = await getOrder(id);
  if (!order) return null;
  if (!codeStimmt(order.accessToken, code)) return null;
  return order;
}
