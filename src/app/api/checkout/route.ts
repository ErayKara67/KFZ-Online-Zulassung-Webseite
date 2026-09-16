import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOrder, withTimeline } from "@/lib/orders-store";
import { auftragMitCode } from "@/lib/order-access";
import { starteBearbeitung } from "@/lib/order-flow";
import { baseUrl, getStripe, stripeConfigured } from "@/lib/stripe";
import { getService } from "@/lib/services";

export const runtime = "nodejs";

/*
 * Der Zugriffscode ist Pflicht.
 *
 * Ohne ihn genügte die Auftragsnummer, um eine Bezahlseite zu erzeugen — und
 * die zeigt Leistung, Betrag und die vorausgefüllte E-Mail-Adresse der Kundin.
 * Auftragsnummern stehen in E-Mails und Links; der Code ist das, was den
 * Vorgang tatsächlich schützt.
 */
const schema = z.object({
  orderId: z.string().min(3).max(40),
  code: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const order = await auftragMitCode(parsed.data.orderId, parsed.data.code);
  if (!order) {
    return NextResponse.json(
      { error: "Auftrag nicht gefunden oder Zugriffscode falsch." },
      { status: 404 },
    );
  }

  const service = getService(order.service);

  /* Demo-Modus ohne Stripe-Schlüssel: Zahlungseingang wird angenommen,
     damit sich der weitere Ablauf vollständig testen lässt. */
  if (!stripeConfigured) {
    await updateOrder(order.id, {
      status: "bezahlt",
      paymentRef: "demo",
      timeline: withTimeline(order.timeline, "bezahlt", "Demo-Modus ohne Zahlungsdienstleister"),
    });
    await starteBearbeitung(order.id);
    return NextResponse.json({
      url: `${baseUrl()}/bestellung/erfolg?auftrag=${order.id}&code=${order.accessToken}&demo=1`,
      demo: true,
    });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Zahlungsarten (Karte, PayPal, Klarna, SEPA-Lastschrift, Apple/Google
      // Pay) werden im Stripe-Dashboard aktiviert; ohne payment_method_types
      // übernimmt Checkout diese Einstellung automatisch.
      locale: "de",
      billing_address_collection: "required",
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, service: order.service },
      /*
       * Dieselbe Auftragsnummer noch einmal an der Zahlung selbst.
       *
       * Bei einer Rückbuchung, einer Erstattung aus dem Stripe-Dashboard oder
       * einer Betrugswarnung meldet Stripe nur die Zahlung — die Sitzung, an
       * der die obere metadata hängt, taucht in diesen Meldungen nicht auf.
       * Ohne diese Zeile ließe sich der zugehörige Auftrag nicht finden.
       */
      payment_intent_data: {
        metadata: { orderId: order.id, service: order.service },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: order.totalCents,
            product_data: {
              name: service?.title ?? "Zulassungsservice",
              description: `Auftrag ${order.id}`,
            },
          },
        },
      ],
      success_url: `${baseUrl()}/bestellung/erfolg?auftrag=${order.id}&code=${order.accessToken}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl()}/bestellung/abbruch?auftrag=${order.id}&code=${order.accessToken}`,
    });

    await updateOrder(order.id, { paymentRef: session.id });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      { error: "Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut." },
      { status: 502 },
    );
  }
}
