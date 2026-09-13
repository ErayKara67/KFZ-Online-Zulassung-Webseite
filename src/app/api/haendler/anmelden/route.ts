import { NextResponse } from "next/server";
import { z } from "zod";
import {
  pruefeZugangscode,
  sitzungswert,
  zugangFehlt,
  SITZUNGSCOOKIE,
} from "@/lib/dealers";

export const runtime = "nodejs";

const schema = z.object({ code: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bitte Zugangscode eingeben." }, { status: 400 });
  }

  /*
   * Ohne eingerichteten Zugang würde jede Eingabe mit „stimmt nicht"
   * abgewiesen — das sähe nach einem Tippfehler aus und man probierte weiter.
   * Der Hinweis richtet sich an den Betreiber, nicht an einen Angreifer: Er
   * verrät keinen Code, sondern nur, dass noch keiner eingerichtet ist.
   */
  if (zugangFehlt) {
    return NextResponse.json(
      {
        error:
          "Für diese Adresse ist noch kein Händlerzugang eingerichtet. " +
          "Der Demozugang ist öffentlich gesperrt — bitte DEALERS in den " +
          "Umgebungsvariablen setzen und neu ausliefern.",
      },
      { status: 503 },
    );
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
