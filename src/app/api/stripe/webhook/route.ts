import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { getOrder, updateOrder, withTimeline } from "@/lib/orders-store";
import { starteBearbeitung } from "@/lib/order-flow";
import { notifyAddress, sendMail } from "@/lib/mail";
import { site } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Stripe-Webhook: markiert Aufträge nach erfolgreicher Zahlung als bezahlt.
 * Endpunkt im Stripe-Dashboard eintragen: /api/stripe/webhook
 * Benötigt STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  if (!stripeConfigured || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert." }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signatur fehlt." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("[webhook] Signatur ungültig", error);
    return NextResponse.json({ error: "Signatur ungültig." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;

    if (orderId) {
      const order = await getOrder(orderId);
      if (order && order.status === "offen") {
        await updateOrder(orderId, {
          status: "bezahlt",
          paymentRef: session.id,
          timeline: withTimeline(order.timeline, "bezahlt"),
        });
        await starteBearbeitung(orderId);

        await sendMail({
          to: order.email,
          subject: `Zahlungseingang bestätigt – Auftrag ${orderId}`,
          text: [
            "Guten Tag,",
            "",
            `wir haben Ihre Zahlung zum Auftrag ${orderId} erhalten und beginnen mit der Bearbeitung.`,
            "Sobald der Vorgang bei der Zulassungsbehörde eingereicht ist, melden wir uns erneut.",
            "",
            `Ihr Team von ${site.name}`,
          ].join("\n"),
        });

        await sendMail({
          to: notifyAddress,
          subject: `Bezahlt: Auftrag ${orderId}`,
          text: `Auftrag ${orderId} wurde bezahlt (Session ${session.id}).`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
