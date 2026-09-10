import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { dealerAusSitzung, SITZUNGSCOOKIE } from "@/lib/dealers";
import { getService } from "@/lib/services";
import { istSofortFaehig, totalCents } from "@/lib/order";
import { makeOrderId } from "@/lib/order";
import { saveOrder, withTimeline, type StoredOrder } from "@/lib/orders-store";
import { sendMail } from "@/lib/mail";
import { baseUrl } from "@/lib/stripe";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";

const schema = z.object({
  vorname: z.string().trim().min(1, "Bitte Vornamen angeben").max(80),
  nachname: z.string().trim().min(1, "Bitte Nachnamen angeben").max(80),
  email: z.string().trim().email("Bitte gültige E-Mail-Adresse angeben"),
  leistung: z.string(),
  sofortzulassung: z.boolean().default(false),
  referenz: z.string().trim().max(60).optional(),
  fahrzeug: z.string().trim().max(120).optional(),
});

/**
 * Vorgang aus dem Verkaufsgespräch heraus anlegen.
 *
 * Der Verkauf gibt nur Name und E-Mail ein. Die Kundin bzw. der Kunde bekommt
 * einen Link und trägt die eigenen Daten selbst ein — Halterdaten, Ausweis und
 * Bankverbindung gehören nicht auf den Zettel am Verkaufstisch.
 */
export async function POST(request: Request) {
  const laden = await cookies();
  const dealer = dealerAusSitzung(laden.get(SITZUNGSCOOKIE)?.value);
  if (!dealer) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 },
    );
  }

  const daten = parsed.data;
  const service = getService(daten.leistung);
  if (!service) {
    return NextResponse.json({ error: "Unbekannte Leistung." }, { status: 400 });
  }

  const sofort = daten.sofortzulassung && istSofortFaehig(service.slug);
  const orderId = makeOrderId();
  const accessToken = randomBytes(16).toString("hex");

  const order: StoredOrder = {
    id: orderId,
    status: "offen",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalCents: totalCents({
      service: service.slug,
      plateSize: "standard",
      extras: [],
      shipping: "standard",
      sofortzulassung: sofort,
    }),
    service: service.slug,
    email: daten.email,
    payload: {
      service: service.slug,
      holder: {
        salutation: "divers",
        firstName: daten.vorname,
        lastName: daten.nachname,
        email: daten.email,
      },
      vehicle: daten.fahrzeug ? { make: daten.fahrzeug } : undefined,
      sofortzulassung: sofort,
    },
    files: [],
    accessToken,
    timeline: withTimeline([], "bestellt", `Angelegt von ${dealer.name}`),
    dealerId: dealer.id,
    dealerReferenz: daten.referenz,
    vomHaendlerAngelegt: true,
    ikfz: sofort ? { aktiv: true, identVerfahren: "eid" } : undefined,
  };

  try {
    await saveOrder(order);
  } catch (fehler) {
    console.error("[haendler:vorgang] Ablage nicht erreichbar", fehler);
    return NextResponse.json(
      {
        error:
          "Der Vorgang konnte nicht gespeichert werden. Bitte prüfen Sie die " +
          "Datenbankanbindung (siehe README, Abschnitt „Ablage“).",
      },
      { status: 503 },
    );
  }

  const params = new URLSearchParams({
    leistung: service.slug,
    auftrag: orderId,
    code: accessToken,
  });
  if (sofort) params.set("sofort", "1");
  const kundenlink = `${baseUrl()}/bestellung?${params.toString()}`;

  await sendMail({
    to: daten.email,
    subject: `Ihre Fahrzeugzulassung — nur noch wenige Angaben`,
    text: [
      `Guten Tag ${daten.vorname} ${daten.nachname},`,
      "",
      `${dealer.name} hat für Sie die ${service.title} vorbereitet.`,
      daten.fahrzeug ? `Fahrzeug: ${daten.fahrzeug}` : "",
      "",
      "Ergänzen Sie bitte Ihre Angaben über diesen Link — das dauert wenige",
      "Minuten, und Sie brauchen dafür keinen Termin:",
      "",
      kundenlink,
      "",
      sofort
        ? "Sie haben die Sofortzulassung gebucht: Nach der Zulassung dürfen Sie\nmit dem vorläufigen Zulassungsnachweis bis zu 14 Tage fahren, während\nPapiere und Plaketten per Post kommen."
        : "Sobald Ihre Angaben vollständig sind, übernehmen wir den Behördengang.",
      "",
      `Ihr Team von ${brand.name}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return NextResponse.json({ ok: true, orderId, kundenlink });
}
