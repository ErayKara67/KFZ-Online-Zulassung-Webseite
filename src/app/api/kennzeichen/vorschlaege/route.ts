import { NextResponse } from "next/server";
import { z } from "zod";
import { ideenPruefen } from "@/lib/plate-ideas";

export const runtime = "nodejs";

const schema = z.object({
  district: z.string().min(1).max(3),
  initialen: z.string().max(4).optional(),
  zahl: z.string().max(6).optional(),
  datum: z.string().max(6).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const vorschlaege = await ideenPruefen(parsed.data, 6);

  return NextResponse.json(
    { vorschlaege },
    { headers: { "Cache-Control": "no-store" } },
  );
}
