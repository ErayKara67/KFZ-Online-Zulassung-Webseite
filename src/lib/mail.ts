import nodemailer from "nodemailer";
import { site } from "./site";

/**
 * E-Mail-Versand über SMTP.
 * Ohne konfigurierte Zugangsdaten (siehe .env.example) wird die Nachricht
 * lediglich in der Serverkonsole ausgegeben – so lässt sich der komplette
 * Ablauf auch ohne Mailserver testen.
 */

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  ORDER_NOTIFY_EMAIL,
} = process.env;

export const mailConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

function transporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** Anhänge werden direkt aus dem Speicher verschickt, nicht von der Platte */
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}

export async function sendMail(input: MailInput): Promise<void> {
  if (!mailConfigured) {
    console.info(
      `[mail:demo] An: ${input.to}\nBetreff: ${input.subject}\n\n${input.text}\n`,
    );
    return;
  }

  await transporter().sendMail({
    from: SMTP_FROM ?? `${site.name} <${site.contact.email}>`,
    ...input,
  });
}

export const notifyAddress = ORDER_NOTIFY_EMAIL ?? site.contact.email;
