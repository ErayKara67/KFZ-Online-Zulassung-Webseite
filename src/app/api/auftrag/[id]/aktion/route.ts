import { NextResponse } from "next/server";
import { z } from "zod";
import { auftragMitCode } from "@/lib/order-access";
import {
  antragEinreichen,
  bescheidAbgerufen,
  identifizierungAbgeschlossen,
  schilderVersandt,
  schilderZugestellt,
} from "@/lib/order-flow";
import { ikfzLiveBetrieb } from "@/lib/ikfz";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().min(8),
  aktion: z.enum([
    "identifizierung",
    "antrag_einreichen",
    "bescheid_abrufen",
    // Nur im Sandbox-Betrieb: simuliert Ereignisse des Versanddienstleisters
    "demo_schilder_versandt",
    "demo_schilder_zugestellt",
  ]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const order = await auftragMitCode(id, parsed.data.code);
  if (!order) {
    return NextResponse.json(
      { error: "Auftrag nicht gefunden oder Zugriffscode falsch." },
      { status: 404 },
    );
  }

  const { aktion } = parsed.data;

  if (aktion.startsWith("demo_") && ikfzLiveBetrieb) {
    return NextResponse.json(
      { error: "Diese Aktion gibt es nur im Sandbox-Betrieb." },
      { status: 403 },
    );
  }

  try {
    switch (aktion) {
      case "identifizierung":
        await identifizierungAbgeschlossen(id);
        break;
      case "demo_schilder_versandt":
        await schilderVersandt(id, `DEMO${id.slice(-6)}`);
        break;
      case "demo_schilder_zugestellt":
        await schilderZugestellt(id);
        break;
      case "antrag_einreichen": {
        const ergebnis = await antragEinreichen(id);
        if (!ergebnis.ok) {
          return NextResponse.json({ ok: false, hinweis: ergebnis.hinweis }, { status: 409 });
        }
        break;
      }
      case "bescheid_abrufen":
        await bescheidAbgerufen(id);
        break;
    }
  } catch (error) {
    console.error("[auftrag:aktion]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Die Aktion konnte nicht ausgeführt werden.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
