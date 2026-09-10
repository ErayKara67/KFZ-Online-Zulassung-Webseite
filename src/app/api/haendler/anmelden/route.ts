import { NextResponse } from "next/server";
import { z } from "zod";
import { pruefeZugangscode, sitzungswert, SITZUNGSCOOKIE } from "@/lib/dealers";

export const runtime = "nodejs";

const schema = z.object({ code: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bitte Zugangscode eingeben." }, { status: 400 });
  }

  const dealer = pruefeZugangscode(parsed.data.code);
  if (!dealer) {
    return NextResponse.json({ error: "Zugangscode stimmt nicht." }, { status: 401 });
  }

  const antwort = NextResponse.json({ ok: true, name: dealer.name });
  antwort.cookies.set(SITZUNGSCOOKIE, sitzungswert(dealer), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return antwort;
}

export async function DELETE() {
  const antwort = NextResponse.json({ ok: true });
  antwort.cookies.delete(SITZUNGSCOOKIE);
  return antwort;
}
