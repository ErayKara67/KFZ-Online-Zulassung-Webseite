import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrder, updateOrder } from "@/lib/orders-store";
import { baseUrl, getStripe, stripeConfigured } from "@/lib/stripe";
import { getService } from "@/lib/services";

export const runtime = "nodejs";

const schema = z.object({ orderId: z.string().min(3).max(40) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const order = await getOrder(parsed.data.orderId);
  if (!order) {
    return NextResponse.json({ error: "Auftrag nicht gefunden." }, { status: 404 });
  }

  const service = getService(order.service);

  /* Demo-Modus ohne Stripe-Schlüssel */
  if (!stripeConfigured) {
    await updateOrder(order.id, { status: "offen", paymentRef: "demo" });
    return NextResponse.json({
      url: `${baseUrl()}/bestellung/erfolg?auftrag=${order.id}&demo=1`,
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
      success_url: `${baseUrl()}/bestellung/erfolg?auftrag=${order.id}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl()}/bestellung/abbruch?auftrag=${order.id}`,
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
