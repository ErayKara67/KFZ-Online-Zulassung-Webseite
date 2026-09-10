import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { uebernehmeAntwort } from "@/lib/order-flow";
import { statusZuordnung, type PartnerAntwortRaw } from "@/lib/ikfz/partner-mapping";
import type { IkfzAntragStatus, IkfzAntwort } from "@/lib/ikfz/types";

export const runtime = "nodejs";

/**
 * Rückruf des Zulassungspartners.
 *
 * Die Behörde entscheidet nicht immer im selben Atemzug. Über diesen Endpunkt
 * meldet der Partner den Zulassungsbescheid nach – der Auftrag wird dann
 * aktualisiert und die Kundin bzw. der Kunde benachrichtigt.
 *
 * Endpunkt beim Partner hinterlegen: POST /api/ikfz/callback
 * Absicherung über HMAC-SHA256 mit IKFZ_PARTNER_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.IKFZ_PARTNER_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Rückruf nicht konfiguriert." }, { status: 501 });
  }

  const roh = await request.text();
  const signatur =
    request.headers.get("x-signature") ?? request.headers.get("x-hub-signature-256") ?? "";

  const erwartet = createHmac("sha256", secret).update(roh, "utf8").digest("hex");
  const geliefert = signatur.replace(/^sha256=/, "");

  if (
    geliefert.length !== erwartet.length ||
    !timingSafeEqual(Buffer.from(erwartet), Buffer.from(geliefert))
  ) {
    return NextResponse.json({ error: "Signatur ungültig." }, { status: 401 });
  }

  let daten: PartnerAntwortRaw;
  try {
    daten = JSON.parse(roh) as PartnerAntwortRaw;
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 });
  }

  const auftragId = daten.externalId;
  if (!auftragId) {
    return NextResponse.json({ error: "externalId fehlt." }, { status: 400 });
  }

  const entscheidung = daten.decision;
  const antwort: IkfzAntwort = {
    status: (statusZuordnung[daten.state ?? ""] ?? "eingereicht") as IkfzAntragStatus,
    antragId: daten.id ?? auftragId,
    hinweis: daten.message,
    fehler: daten.errors,
    bescheid:
      entscheidung?.fileNumber
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

  const aktualisiert = await uebernehmeAntwort(auftragId, antwort);
  if (!aktualisiert) {
    // 200 zurückgeben, damit der Partner nicht endlos wiederholt.
    return NextResponse.json({ ok: false, hinweis: "Auftrag unbekannt." });
  }

  return NextResponse.json({ ok: true });
}
