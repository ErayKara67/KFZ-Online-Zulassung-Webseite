import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeConfigured, baseUrl } from "@/lib/stripe";
import {
  getOrder,
  mitVermerk,
  updateOrder,
  withTimeline,
  type StoredOrder,
} from "@/lib/orders-store";
import { starteBearbeitung } from "@/lib/order-flow";
import { notifyAddress, sendMail } from "@/lib/mail";
import { formatPrice } from "@/lib/services";
import { site } from "@/lib/site";

export const runtime = "nodejs";

/**
 * Meldungen von Stripe.
 *
 * Endpunkt im Stripe-Dashboard: /api/stripe/webhook
 * Benötigt STRIPE_WEBHOOK_SECRET.
 *
 * Verarbeitet werden acht Ereignisse — welche und warum, steht jeweils am
 * zuständigen Abschnitt. Alles andere wird still quittiert: Stripe soll eine
 * Empfangsbestätigung bekommen, sonst wiederholt es die Zustellung und schaltet
 * den Endpunkt irgendwann ab.
 */

/* ------------------------------------------------------------- Zuordnung */

/**
 * Findet den Auftrag zu einer Zahlung.
 *
 * Bei Rückbuchungen, Erstattungen und Betrugswarnungen nennt Stripe nur die
 * Zahlung, nicht die Bestellsitzung. Die Auftragsnummer hängt deshalb zusätzlich
 * an der Zahlung selbst (siehe payment_intent_data in /api/checkout). Falls sie
 * dort einmal fehlt — etwa bei Zahlungen aus der Zeit vor dieser Änderung —
 * wird über die Zahlung nachgeschlagen.
 */
async function auftragZurZahlung(
  direkteMetadaten: Stripe.Metadata | null | undefined,
  chargeId: string | null,
  paymentIntentId: string | null,
): Promise<{ id: string; order: StoredOrder } | null> {
  const stripe = getStripe();
  const kandidaten: (string | undefined)[] = [direkteMetadaten?.orderId];

  if (!kandidaten[0] && chargeId) {
    try {
      const charge = await stripe.charges.retrieve(chargeId);
      kandidaten.push(charge.metadata?.orderId);
    } catch (fehler) {
      console.error("[webhook] Zahlung nicht abrufbar", fehler);
    }
  }

  if (!kandidaten.some(Boolean) && paymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      kandidaten.push(pi.metadata?.orderId);
    } catch (fehler) {
      console.error("[webhook] Zahlungsvorgang nicht abrufbar", fehler);
    }
  }

  for (const id of kandidaten) {
    if (!id) continue;
    const order = await getOrder(id);
    if (order) return { id, order };
  }
  return null;
}

/** Link, unter dem die Kundin oder der Kunde den Vorgang einsehen kann */
function auftragslink(id: string, order: StoredOrder): string {
  return `${baseUrl()}/auftrag/${id}?code=${order.accessToken}`;
}

/* --------------------------------------------------------------- Zahlung */

async function zahlungEingegangen(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) return;
  const order = await getOrder(orderId);
  if (!order) return;

  /*
   * „completed" heißt: Der Bezahlvorgang ist durchlaufen — nicht zwingend, dass
   * Geld geflossen ist. Bei Lastschrift und Klarna steht die Bestätigung der
   * Bank noch aus; die Sitzung trägt dann payment_status "unpaid" und der
   * Eingang meldet sich später mit "async_payment_succeeded".
   *
   * Ohne diese Unterscheidung würden wir sofort loslegen — Kennzeichen
   * reservieren, Schilder prägen, Gebühren bei der Behörde auslegen — und
   * säßen auf den Kosten, wenn die Abbuchung danach platzt.
   */
  if (session.payment_status === "unpaid") {
    console.info(`[webhook] ${orderId}: Zahlung angestoßen, Eingang steht aus`);
    await updateOrder(orderId, {
      paymentRef: session.id,
      vermerke: mitVermerk(
        order.vermerke,
        "Zahlung angestoßen — Bankbestätigung steht noch aus",
      ),
    });
    return;
  }

  if (order.status !== "offen") return;

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

async function zahlungFehlgeschlagen(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) return;
  const order = await getOrder(orderId);
  if (!order) return;

  console.warn(`[webhook] Zahlung fehlgeschlagen für ${orderId}`);
  await updateOrder(orderId, {
    vermerke: mitVermerk(
      order.vermerke,
      "Zahlung fehlgeschlagen — Auftrag wartet weiter auf Zahlungseingang",
      "warnung",
    ),
  });

  await sendMail({
    to: order.email,
    subject: `Zahlung fehlgeschlagen – Auftrag ${orderId}`,
    text: [
      "Guten Tag,",
      "",
      `die Zahlung zu Ihrem Auftrag ${orderId} konnte nicht ausgeführt werden.`,
      "Ihr Auftrag ist weiterhin vorgemerkt. Über diesen Link können Sie die",
      "Zahlung wiederholen:",
      "",
      auftragslink(orderId, order),
      "",
      `Ihr Team von ${site.name}`,
    ].join("\n"),
  });

  await sendMail({
    to: notifyAddress,
    subject: `Zahlung fehlgeschlagen: Auftrag ${orderId}`,
    text: `Die Zahlung zu Auftrag ${orderId} ist fehlgeschlagen (Session ${session.id}).`,
  });
}

/**
 * Bezahlseite verfallen — angefangen, nie bezahlt.
 *
 * Der Auftrag bleibt bestehen und bezahlbar; verfallen ist nur die eine
 * Bezahlseite. Ohne diesen Vermerk stünde der Vorgang im Händlerzugang
 * ununterscheidbar neben frisch angelegten und niemand hakte je nach.
 */
async function sitzungAbgelaufen(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  if (!orderId) return;
  const order = await getOrder(orderId);
  if (!order || order.status !== "offen") return;

  await updateOrder(orderId, {
    vermerke: mitVermerk(
      order.vermerke,
      "Bezahlvorgang abgebrochen — Erinnerung verschickt",
    ),
  });

  await sendMail({
    to: order.email,
    subject: `Ihr Auftrag ${orderId} wartet noch auf die Zahlung`,
    text: [
      "Guten Tag,",
      "",
      `Ihre Bestellung ${orderId} liegt bei uns bereit, die Zahlung wurde aber`,
      "nicht abgeschlossen. Ihre Angaben sind gespeichert — Sie müssen nichts",
      "erneut ausfüllen.",
      "",
      "Über diesen Link sehen Sie Ihren Vorgang und können die Zahlung starten:",
      "",
      auftragslink(orderId, order),
      "",
      "Wenn Sie es sich anders überlegt haben, können Sie diese Nachricht",
      "einfach ignorieren.",
      "",
      `Ihr Team von ${site.name}`,
    ].join("\n"),
  });
}

/* ----------------------------------------------------------- Rückbuchung */

/**
 * Der Kunde hat der Abbuchung bei seiner Bank widersprochen.
 *
 * Stripe zieht das Geld zurück und behält eine Gebühr ein. Für Belege gibt es
 * eine Frist — verstreicht sie ungenutzt, gilt der Fall als verloren. Deshalb
 * steht die Frist in der Mail, nicht nur die Tatsache.
 *
 * Der Auftrag wird bewusst nicht automatisch storniert: Ob weitergearbeitet
 * wird, ist eine Entscheidung mit Geld dahinter und gehört zu einem Menschen.
 */
async function rueckbuchungEroeffnet(dispute: Stripe.Dispute) {
  const treffer = await auftragZurZahlung(
    dispute.metadata,
    typeof dispute.charge === "string" ? dispute.charge : (dispute.charge?.id ?? null),
    typeof dispute.payment_intent === "string" ? dispute.payment_intent : null,
  );

  const frist = dispute.evidence_details?.due_by
    ? new Date(dispute.evidence_details.due_by * 1000).toLocaleString("de-DE", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "siehe Stripe-Dashboard";

  const zeilen = [
    `Betrag: ${formatPrice(dispute.amount)}`,
    `Grund laut Bank: ${dispute.reason}`,
    `Belege einreichen bis: ${frist}`,
    "",
    "Reagieren Sie nicht rechtzeitig, gilt die Rückbuchung als verloren.",
    "Belege reichen Sie im Stripe-Dashboard unter Zahlungen › Rückbuchungen ein.",
  ];

  if (treffer) {
    const { id, order } = treffer;
    await updateOrder(id, {
      vermerke: mitVermerk(
        order.vermerke,
        `Rückbuchung eröffnet (${formatPrice(dispute.amount)}) — Frist beachten`,
        "geld",
      ),
    });
    zeilen.unshift(`Auftrag: ${id}`, `Kunde: ${order.email}`, "");
  } else {
    zeilen.unshift(
      "Zu dieser Zahlung ließ sich kein Auftrag zuordnen.",
      `Stripe-Zahlung: ${typeof dispute.charge === "string" ? dispute.charge : "unbekannt"}`,
      "",
    );
  }

  await sendMail({
    to: notifyAddress,
    subject: `Rückbuchung eingegangen${treffer ? ` – Auftrag ${treffer.id}` : ""}`,
    text: zeilen.join("\n"),
  });
}

/** Die Rückbuchung ist entschieden — gewonnen, verloren oder eingestellt. */
async function rueckbuchungEntschieden(dispute: Stripe.Dispute) {
  const treffer = await auftragZurZahlung(
    dispute.metadata,
    typeof dispute.charge === "string" ? dispute.charge : (dispute.charge?.id ?? null),
    typeof dispute.payment_intent === "string" ? dispute.payment_intent : null,
  );

  const ausgang =
    dispute.status === "won"
      ? "gewonnen — das Geld bleibt bei Ihnen"
      : dispute.status === "lost"
        ? "verloren — der Betrag ist endgültig abgezogen"
        : `abgeschlossen (${dispute.status})`;

  if (treffer) {
    await updateOrder(treffer.id, {
      vermerke: mitVermerk(
        treffer.order.vermerke,
        `Rückbuchung ${dispute.status === "won" ? "gewonnen" : dispute.status === "lost" ? "verloren" : "abgeschlossen"}`,
        "geld",
      ),
    });
  }

  await sendMail({
    to: notifyAddress,
    subject: `Rückbuchung ${ausgang.split(" ")[0]}${treffer ? ` – Auftrag ${treffer.id}` : ""}`,
    text: [
      treffer ? `Auftrag: ${treffer.id}` : "Kein Auftrag zugeordnet.",
      `Betrag: ${formatPrice(dispute.amount)}`,
      `Ergebnis: ${ausgang}`,
    ].join("\n"),
  });
}

/**
 * Stripe hält eine Zahlung für betrügerisch, bevor die Bank sie zurückholt.
 *
 * Erstattet man jetzt von sich aus, entfällt die Rückbuchungsgebühr. Das lohnt
 * sich besonders, solange die Schilder noch nicht raus sind.
 */
async function betrugswarnung(warnung: Stripe.Radar.EarlyFraudWarning) {
  const treffer = await auftragZurZahlung(
    null,
    typeof warnung.charge === "string" ? warnung.charge : (warnung.charge?.id ?? null),
    typeof warnung.payment_intent === "string" ? warnung.payment_intent : null,
  );

  if (treffer) {
    await updateOrder(treffer.id, {
      vermerke: mitVermerk(
        treffer.order.vermerke,
        "Betrugswarnung von Stripe — vor Versand prüfen",
        "warnung",
      ),
    });
  }

  await sendMail({
    to: notifyAddress,
    subject: `Betrugswarnung${treffer ? ` – Auftrag ${treffer.id}` : ""}`,
    text: [
      treffer
        ? `Auftrag: ${treffer.id}\nKunde: ${treffer.order.email}`
        : "Kein Auftrag zugeordnet.",
      `Einstufung: ${warnung.fraud_type}`,
      "",
      "Stripe stuft diese Zahlung als wahrscheinlich betrügerisch ein. Eine",
      "Rückbuchung folgt erfahrungsgemäß. Erstatten Sie von sich aus, entfällt",
      "die Rückbuchungsgebühr.",
      "",
      "Vor einer Entscheidung prüfen: Sind die Schilder schon unterwegs? Wurden",
      "bereits amtliche Gebühren ausgelegt?",
    ].join("\n"),
  });
}

/* ---------------------------------------------------------- Erstattungen */

/**
 * Eine Zahlung wurde erstattet — ganz oder teilweise.
 *
 * Erstattungen über die eigene Sachbearbeitungs-Schnittstelle sind im Auftrag
 * bereits vermerkt. Dieser Weg fängt die anderen ab: die, die jemand direkt im
 * Stripe-Dashboard auslöst. Verglichen werden Summen, nicht einzelne Vorgänge —
 * so lässt sich auch eine Teilerstattung sauber nachtragen, ohne dass etwas
 * doppelt gezählt wird.
 */
async function erstattungAbgleichen(charge: Stripe.Charge) {
  const treffer = await auftragZurZahlung(
    charge.metadata,
    charge.id,
    typeof charge.payment_intent === "string" ? charge.payment_intent : null,
  );
  if (!treffer) return;

  const { id, order } = treffer;
  const beiUns = (order.erstattungen ?? []).reduce((s, e) => s + e.betragCent, 0);
  const beiStripe = charge.amount_refunded;
  const differenz = beiStripe - beiUns;

  if (differenz <= 0) return; /* schon vermerkt */

  console.info(`[webhook] ${id}: ${formatPrice(differenz)} außerhalb erstattet`);
  const vollstaendig = beiStripe >= order.totalCents;

  await updateOrder(id, {
    status: vollstaendig ? "storniert" : order.status,
    timeline: vollstaendig
      ? withTimeline(
          order.timeline,
          "abgeschlossen",
          "Storniert und erstattet",
        )
      : order.timeline,
    vermerke: mitVermerk(
      order.vermerke,
      vollstaendig
        ? "Vollständig erstattet (im Stripe-Dashboard ausgelöst)"
        : `Teilerstattung ${formatPrice(differenz)} (im Stripe-Dashboard ausgelöst)`,
      "geld",
    ),
    erstattungen: [
      ...(order.erstattungen ?? []),
      {
        betragCent: differenz,
        grund: "Im Stripe-Dashboard ausgelöst",
        referenz: charge.id,
        ausgeloestVon: "Stripe-Dashboard",
        am: new Date().toISOString(),
      },
    ],
  });

  await sendMail({
    to: notifyAddress,
    subject: `Erstattung übernommen – Auftrag ${id}`,
    text: [
      `Für Auftrag ${id} wurden ${formatPrice(differenz)} außerhalb der`,
      "Sachbearbeitung erstattet. Der Vorgang ist entsprechend nachgetragen.",
      vollstaendig ? "Der Auftrag gilt jetzt als storniert." : "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

/* ------------------------------------------------------------- Empfänger */

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

  /*
   * Fehler in einem Handler dürfen die Antwort nicht verhindern. Stripe würde
   * sonst dieselbe Meldung immer wieder schicken — und bei dauerhaftem Fehler
   * den Endpunkt abschalten. Der Fehler wird protokolliert, die Meldung
   * quittiert.
   */
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await zahlungEingegangen(event.data.object);
        break;

      case "checkout.session.async_payment_failed":
        await zahlungFehlgeschlagen(event.data.object);
        break;

      case "checkout.session.expired":
        await sitzungAbgelaufen(event.data.object);
        break;

      case "charge.dispute.created":
        await rueckbuchungEroeffnet(event.data.object);
        break;

      case "charge.dispute.closed":
        await rueckbuchungEntschieden(event.data.object);
        break;

      case "radar.early_fraud_warning.created":
        await betrugswarnung(event.data.object);
        break;

      case "charge.refunded":
        await erstattungAbgleichen(event.data.object);
        break;

      default:
        /* Bewusst unbeachtet — siehe Kopf der Datei */
        break;
    }
  } catch (fehler) {
    console.error(`[webhook] Fehler bei ${event.type}`, fehler);
  }

  return NextResponse.json({ received: true });
}
