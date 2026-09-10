import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyAddress, sendMail } from "@/lib/mail";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2, "Bitte Namen angeben").max(120),
  email: z.string().trim().email("Bitte gültige E-Mail-Adresse angeben"),
  phone: z.string().trim().max(60).optional(),
  topic: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "Bitte beschreiben Sie Ihr Anliegen").max(4000),
  privacy: z.literal(true, { message: "Bitte Datenschutzhinweise bestätigen" }),
  /* Honeypot gegen Spam-Bots */
  website: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 422 },
    );
  }

  const { name, email, phone, topic, message } = parsed.data;

  await sendMail({
    to: notifyAddress,
    replyTo: email,
    subject: `Kontaktanfrage: ${topic || "Allgemein"} – ${name}`,
    text: [
      `Name: ${name}`,
      `E-Mail: ${email}`,
      `Telefon: ${phone || "–"}`,
      `Thema: ${topic || "–"}`,
      "",
      message,
    ].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
