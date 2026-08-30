import { formatPrice, getService } from "./services";
import { getStripe, stripeConfigured } from "./stripe";
import {
  getOrder,
  updateOrder,
  withTimeline,
  type StoredOrder,
} from "./orders-store";
import { einkaufspreise } from "./costs";
import { notifyAddress, sendMail } from "./mail";
import { site } from "./site";

/**
 * Storno und Erstattung.
 *
 * Die AGB sagen zu: Wird ein Vorgang nicht abgeschlossen, werden nicht
 * angefallene Leistungen erstattet. Was „nicht angefallen" heißt, hängt davon
 * ab, wie weit der Vorgang gelaufen ist – und daran hängt echtes Geld, das
 * teilweise schon bei Behörde und Prägepartner liegt.
 *
 * Diese Datei rechnet einen Vorschlag aus. Die Entscheidung trifft ein Mensch:
 * Ob amtliche Gebühren tatsächlich verloren sind, ob aus Kulanz mehr erstattet
 * wird, ob ein Fehler auf unserer Seite lag – das kann keine Regel wissen.
 */

export type Stornogrund =
  | "kundenwunsch"
  | "widerruf"
  | "nicht_durchfuehrbar"
  | "unterlagen_unvollstaendig"
  | "behoerde_abgelehnt"
  | "fehler_intern";

export interface ErstattungsVorschlag {
  /** Vorgeschlagener Erstattungsbetrag in Cent */
  betragCent: number;
  /** Bereits gezahlter Bruttobetrag */
  gezahltCent: number;
  /** Was einbehalten wird, mit Begründung */
  einbehalte: { label: string; betrag: number; grund: string }[];
  begruendung: string;
  /** true, wenn ein Mensch die Zahlen prüfen sollte, bevor erstattet wird */
  pruefenLassen: boolean;
}

/**
 * Ermittelt, wie weit der Vorgang gelaufen ist – daran hängt der Vorschlag.
 */
function fortschritt(order: StoredOrder) {
  const hat = (key: string) => order.timeline.some((t) => t.key === key);
  return {
    bezahlt: hat("bezahlt"),
    reserviert: hat("kennzeichen_reserviert"),
    gepraegt: hat("schilder_produziert"),
    versandt: hat("schilder_versandt"),
    eingereicht: hat("antrag_eingereicht"),
    beschieden: hat("bescheid_erteilt"),
  };
}

export function berechneErstattung(
  order: StoredOrder,
  grund: Stornogrund,
): ErstattungsVorschlag {
  const gezahlt = order.totalCents;
  const bereitsErstattet = (order.erstattungen ?? []).reduce(
    (s, e) => s + e.betragCent,
    0,
  );
  const offen = Math.max(0, gezahlt - bereitsErstattet);

  const f = fortschritt(order);
  const einbehalte: ErstattungsVorschlag["einbehalte"] = [];

  /* Fehler auf unserer Seite: voller Betrag zurück, ohne Abzüge. */
  if (grund === "fehler_intern") {
    return {
      betragCent: offen,
      gezahltCent: gezahlt,
      einbehalte: [],
      begruendung:
        "Fehler im eigenen Verantwortungsbereich – vollständige Erstattung ohne Abzug.",
      pruefenLassen: false,
    };
  }

  /* Noch nichts passiert außer der Zahlung. */
  if (!f.reserviert) {
    return {
      betragCent: offen,
      gezahltCent: gezahlt,
      einbehalte: [],
      begruendung: "Die Bearbeitung hatte noch nicht begonnen.",
      pruefenLassen: false,
    };
  }

  /*
   * Geprägte Schilder sind nach Kundenvorgabe angefertigt. Dafür besteht kein
   * Widerrufsrecht (§ 312g Abs. 2 Nr. 1 BGB), und weiterverwenden lassen sie
   * sich nicht.
   */
  if (f.gepraegt && einkaufspreise.schilderPaar > 0) {
    einbehalte.push({
      label: "Kennzeichenschilder",
      betrag: einkaufspreise.schilderPaar,
      grund: "Nach Ihren Vorgaben angefertigt und nicht weiterverwendbar.",
    });
  }

  if (f.versandt && einkaufspreise.expressversand > 0) {
    einbehalte.push({
      label: "Versand",
      betrag: einkaufspreise.expressversand,
      grund: "Sendung war bereits unterwegs.",
    });
  }

  /*
   * Ab der Einreichung sind amtliche Gebühren verauslagt. Ob die Behörde sie
   * erstattet, ist von Bezirk und Vorgang abhängig – deshalb hier nur ein
   * Vorschlag mit Prüfhinweis, keine automatische Kürzung ins Blaue.
   */
  if (f.eingereicht && einkaufspreise.amtlicheGebuehren > 0) {
    einbehalte.push({
      label: "Amtliche Gebühren",
      betrag: einkaufspreise.amtlicheGebuehren,
      grund: "Bereits an die Zulassungsbehörde verauslagt.",
    });
  }

  /* Bearbeitungsaufwand: erst ab tatsächlicher Einreichung. */
  if (f.eingereicht) {
    einbehalte.push({
      label: "Bearbeitung",
      betrag: einkaufspreise.partnerVorgang + einkaufspreise.signatur,
      grund: "Vorgang war bei der Zulassungsbehörde eingereicht.",
    });
  }

  const summeEinbehalte = einbehalte.reduce((s, e) => s + e.betrag, 0);
  const betrag = Math.max(0, offen - summeEinbehalte);

  return {
    betragCent: betrag,
    gezahltCent: gezahlt,
    einbehalte,
    begruendung: f.beschieden
      ? "Die Zulassung war bereits erteilt – die Leistung ist erbracht. Eine Erstattung ist hier eine Kulanzentscheidung."
      : f.eingereicht
        ? "Der Vorgang lag bereits bei der Zulassungsbehörde."
        : "Die Bearbeitung hatte begonnen.",
    pruefenLassen:
      f.beschieden ||
      (f.eingereicht && einkaufspreise.amtlicheGebuehren === 0) ||
      (f.gepraegt && einkaufspreise.schilderPaar === 0),
  };
}

export interface ErstattungsErgebnis {
  ok: boolean;
  hinweis: string;
  betragCent?: number;
  order?: StoredOrder | null;
}

/**
 * Führt die Erstattung aus: Rückzahlung beim Zahlungsdienstleister,
 * Vermerk am Auftrag, Benachrichtigung.
 */
export async function erstatte(
  orderId: string,
  grund: Stornogrund,
  optionen: { betragCent?: number; notiz?: string; ausgeloestVon: string },
): Promise<ErstattungsErgebnis> {
  const order = await getOrder(orderId);
  if (!order) return { ok: false, hinweis: "Auftrag nicht gefunden." };

  if (order.status === "offen") {
    return {
      ok: false,
      hinweis: "Für diesen Auftrag ist kein Zahlungseingang verbucht.",
    };
  }

  const vorschlag = berechneErstattung(order, grund);
  const betrag = optionen.betragCent ?? vorschlag.betragCent;

  const bereitsErstattet = (order.erstattungen ?? []).reduce(
    (s, e) => s + e.betragCent,
    0,
  );

  if (betrag <= 0) {
    return { ok: false, hinweis: "Der Erstattungsbetrag ist null." };
  }

  if (bereitsErstattet + betrag > order.totalCents) {
    return {
      ok: false,
      hinweis: `Mehr als gezahlt lässt sich nicht erstatten. Gezahlt ${formatPrice(
        order.totalCents,
      )}, bereits erstattet ${formatPrice(bereitsErstattet)}.`,
    };
  }

  /* Rückzahlung auslösen */
  let referenz = "demo";

  if (stripeConfigured && order.paymentRef && order.paymentRef !== "demo") {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(order.paymentRef);
      const zahlung = session.payment_intent;

      if (!zahlung || typeof zahlung !== "string") {
        return {
          ok: false,
          hinweis: "Zur Zahlung ließ sich keine Transaktion finden.",
        };
      }

      const refund = await stripe.refunds.create(
        { payment_intent: zahlung, amount: betrag, reason: "requested_by_customer" },
        // Verhindert doppelte Rückzahlung bei einem Wiederholungsversuch
        { idempotencyKey: `refund-${orderId}-${bereitsErstattet + betrag}` },
      );
      referenz = refund.id;
    } catch (fehler) {
      console.error("[erstattung]", fehler);
      return {
        ok: false,
        hinweis:
          fehler instanceof Error
            ? `Rückzahlung fehlgeschlagen: ${fehler.message}`
            : "Rückzahlung fehlgeschlagen.",
      };
    }
  }

  const vollstaendig = bereitsErstattet + betrag >= order.totalCents;

  const aktualisiert = await updateOrder(orderId, {
    status: vollstaendig ? "storniert" : order.status,
    timeline: withTimeline(
      order.timeline,
      "abgeschlossen",
      vollstaendig ? "Storniert und erstattet" : "Teilerstattung",
    ),
    erstattungen: [
      ...(order.erstattungen ?? []),
      {
        betragCent: betrag,
        grund,
        notiz: optionen.notiz,
        referenz,
        ausgeloestVon: optionen.ausgeloestVon,
        am: new Date().toISOString(),
      },
    ],
  });

  const service = getService(order.service);

  await sendMail({
    to: order.email,
    subject: `Erstattung zu Auftrag ${orderId}`,
    text: [
      "Guten Tag,",
      "",
      `wir haben Ihren Auftrag ${orderId} (${service?.title ?? "Zulassungsservice"}) storniert.`,
      `Erstattet werden ${formatPrice(betrag)}. Je nach Zahlungsart dauert die`,
      "Gutschrift bis zu zehn Bankarbeitstage.",
      ...(vorschlag.einbehalte.length > 0 && optionen.betragCent === undefined
        ? [
            "",
            "Nicht erstattet werden:",
            ...vorschlag.einbehalte.map(
              (e) => `- ${e.label} (${formatPrice(e.betrag)}): ${e.grund}`,
            ),
          ]
        : []),
      ...(optionen.notiz ? ["", optionen.notiz] : []),
      "",
      `Ihr Team von ${site.name}`,
      `${site.contact.phone} · ${site.contact.email}`,
    ].join("\n"),
  });

  await sendMail({
    to: notifyAddress,
    subject: `Erstattung ausgeführt: ${orderId} über ${formatPrice(betrag)}`,
    text: [
      `Auftrag: ${orderId}`,
      `Grund: ${grund}`,
      `Betrag: ${formatPrice(betrag)}`,
      `Vorschlag des Systems: ${formatPrice(vorschlag.betragCent)}`,
      optionen.betragCent !== undefined
        ? "Betrag wurde manuell abweichend gesetzt."
        : "Vorschlag übernommen.",
      `Referenz: ${referenz}`,
      `Ausgelöst von: ${optionen.ausgeloestVon}`,
      optionen.notiz ? `Notiz: ${optionen.notiz}` : "",
    ].join("\n"),
  });

  return {
    ok: true,
    hinweis: vollstaendig
      ? `Auftrag storniert, ${formatPrice(betrag)} erstattet.`
      : `Teilerstattung über ${formatPrice(betrag)} ausgeführt.`,
    betragCent: betrag,
    order: aktualisiert,
  };
}
