import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getOrder } from "@/lib/orders-store";
import { berechneErstattung, erstatte } from "@/lib/refunds";

export const runtime = "nodejs";

/**
 * Storno und Erstattung durch die Sachbearbeitung.
 *
 * Absicherung über ein Token aus der Umgebung. Das ist bewusst schlicht und
 * reicht für den Anfang mit wenigen Personen – ersetzt aber kein
 * Sachbearbeiter-Backend mit persönlichen Konten, Rollen und Zwei-Faktor.
 * Solange es das nicht gibt: Token wie ein Passwort behandeln und bei
 * Personalwechsel tauschen.
 *
 * GET  ?auftrag=…&grund=…  → Vorschlag ansehen, ohne etwas auszulösen
 * POST { auftrag, grund, betragCent?, notiz? } → Erstattung ausführen
 */

const gruende = [
  "kundenwunsch",
  "widerruf",
  "nicht_durchfuehrbar",
  "unterlagen_unvollstaendig",
  "behoerde_abgelehnt",
  "fehler_intern",
] as const;

const schema = z.object({
  auftrag: z.string().min(3).max(40),
  grund: z.enum(gruende),
  /** Abweichender Betrag in Cent – überstimmt den Vorschlag bewusst */
  betragCent: z.number().int().positive().optional(),
  notiz: z.string().max(500).optional(),
});

function berechtigt(request: Request): boolean {
  const erwartet = process.env.ADMIN_API_TOKEN;
  if (!erwartet || erwartet.length < 24) return false;

  const kopf = request.headers.get("authorization") ?? "";
  const geliefert = kopf.replace(/^Bearer\s+/i, "");
  if (geliefert.length !== erwartet.length) return false;

  return timingSafeEqual(Buffer.from(erwartet), Buffer.from(geliefert));
}

export async function GET(request: Request) {
  if (!berechtigt(request)) {
    return NextResponse.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const url = new URL(request.url);
  const auftrag = url.searchParams.get("auftrag") ?? "";
  const grund = url.searchParams.get("grund") ?? "kundenwunsch";

  if (!(gruende as readonly string[]).includes(grund)) {
    return NextResponse.json(
      { error: `Unbekannter Grund. Erlaubt: ${gruende.join(", ")}` },
      { status: 400 },
    );
  }

  const order = await getOrder(auftrag);
  if (!order) {
    return NextResponse.json({ error: "Auftrag nicht gefunden." }, { status: 404 });
  }

  const vorschlag = berechneErstattung(order, grund as (typeof gruende)[number]);

  return NextResponse.json(
    {
      auftrag: order.id,
      status: order.status,
      gezahltCent: order.totalCents,
      bereitsErstattetCent: (order.erstattungen ?? []).reduce(
        (s, e) => s + e.betragCent,
        0,
      ),
      vorschlag,
      timeline: order.timeline.map((t) => t.key),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!berechtigt(request)) {
    return NextResponse.json({ error: "Nicht berechtigt." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const ergebnis = await erstatte(parsed.data.auftrag, parsed.data.grund, {
    betragCent: parsed.data.betragCent,
    notiz: parsed.data.notiz,
    ausgeloestVon: "Sachbearbeitung (Token)",
  });

  return NextResponse.json(ergebnis, { status: ergebnis.ok ? 200 : 409 });
}
