import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPlate } from "@/lib/plate";

const schema = z.object({
  district: z.string().max(5),
  letters: z.string().max(4),
  numbers: z.string().max(6),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  /*
   * Formprüfung immer, Verfügbarkeitsabfrage nur bei konfigurierter
   * Schnittstelle (PLATE_CHECK_URL). Siehe src/lib/plate-availability.ts.
   */
  const result = await checkPlate(parsed.data);

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
