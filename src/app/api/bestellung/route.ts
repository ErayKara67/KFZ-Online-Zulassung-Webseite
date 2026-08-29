import { NextResponse } from "next/server";
import { orderSchema, totalCents, type OrderPayload } from "@/lib/order";
import { getService, formatPrice } from "@/lib/services";
import { makeOrderId } from "@/lib/order";
import { saveOrder, storeUpload, type StoredOrder } from "@/lib/orders-store";
import { notifyAddress, sendMail } from "@/lib/mail";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
];

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const raw = form.get("payload");
  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Auftragsdaten fehlen." }, { status: 400 });
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Auftragsdaten sind fehlerhaft." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Die Angaben sind unvollständig.",
        issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      },
      { status: 422 },
    );
  }

  const payload: OrderPayload = parsed.data;
  const service = getService(payload.service);
  if (!service) {
    return NextResponse.json({ error: "Unbekannte Leistung." }, { status: 400 });
  }

  const orderId = makeOrderId();

  /* Dateien prüfen und ablegen */
  const stored: StoredOrder["files"] = [];
  for (const [key, value] of form.entries()) {
    if (!key.startsWith("datei_") || !(value instanceof File)) continue;
    if (value.size === 0) continue;
    if (value.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `Die Datei „${value.name}“ ist größer als 10 MB.` },
        { status: 413 },
      );
    }
    if (value.type && !ALLOWED_TYPES.includes(value.type)) {
      return NextResponse.json(
        { error: `Dateityp von „${value.name}“ wird nicht unterstützt (JPG, PNG, HEIC oder PDF).` },
        { status: 415 },
      );
    }
    stored.push(await storeUpload(orderId, key.replace(/^datei_/, ""), value));
  }

  const total = totalCents({
    service: service.slug,
    plateSize: payload.plateSize,
    extras: payload.extras,
    shipping: payload.shippingMethod,
  });

  const order: StoredOrder = {
    id: orderId,
    status: "offen",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalCents: total,
    service: service.slug,
    email: payload.holder.email,
    payload: redact(payload),
    files: stored,
  };

  await saveOrder(order);

  const plate = payload.plate
    ? `${payload.plate.district}-${payload.plate.letters} ${payload.plate.numbers}`
    : "–";

  await sendMail({
    to: notifyAddress,
    replyTo: payload.holder.email,
    subject: `Neuer Auftrag ${orderId} – ${service.title}`,
    text: [
      `Auftragsnummer: ${orderId}`,
      `Leistung: ${service.title}`,
      `Kennzeichen: ${plate}`,
      `Betrag: ${formatPrice(total)}`,
      "",
      `Halter: ${payload.holder.firstName} ${payload.holder.lastName}`,
      `Anschrift: ${payload.holder.street}, ${payload.holder.zip} ${payload.holder.city}`,
      `E-Mail: ${payload.holder.email}`,
      `Telefon: ${payload.holder.phone}`,
      "",
      `Anhänge: ${stored.map((f) => f.filename).join(", ") || "keine"}`,
      "",
      payload.note ? `Nachricht: ${payload.note}` : "",
    ].join("\n"),
    attachments: stored.map((f) => ({ filename: f.filename, path: f.storedAs })),
  });

  await sendMail({
    to: payload.holder.email,
    subject: `Ihr Auftrag ${orderId} bei ${site.name}`,
    text: [
      `Guten Tag ${payload.holder.firstName} ${payload.holder.lastName},`,
      "",
      `vielen Dank für Ihren Auftrag. Wir haben ihn unter der Nummer ${orderId} erfasst.`,
      `Leistung: ${service.title}`,
      `Kennzeichen: ${plate}`,
      `Betrag: ${formatPrice(total)}`,
      "",
      "Nach Zahlungseingang starten wir mit der Bearbeitung. Über jeden",
      "Bearbeitungsschritt informieren wir Sie per E-Mail.",
      "",
      `Ihr Team von ${site.name}`,
      `${site.contact.phone} · ${site.contact.email}`,
    ].join("\n"),
  });

  return NextResponse.json({ orderId, totalCents: total });
}

/** IBAN und Ausweisdaten werden nur maskiert gespeichert. */
function redact(payload: OrderPayload): OrderPayload {
  if (!payload.sepa?.iban) return payload;
  return {
    ...payload,
    sepa: {
      ...payload.sepa,
      iban: payload.sepa.iban.replace(/^(.{4}).*(.{4})$/, "$1************$2"),
    },
  };
}
