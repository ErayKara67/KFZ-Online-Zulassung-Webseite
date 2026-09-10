import type { StoredOrder } from "./orders-store";

/**
 * Übersetzt einen Auftrag in eine Aussage, die im Autohaus zählt:
 * Wo steht der Vorgang, wer ist als Nächstes am Zug, und kann das Fahrzeug
 * schon übergeben werden?
 */

export type Fortschritt =
  | "warte_auf_kunden"
  | "offen"
  | "in_bearbeitung"
  | "wartet_auf_schilder"
  | "wartet_auf_kundenaktion"
  | "bei_behoerde"
  | "fahrbereit"
  | "abgeschlossen"
  | "storniert";

export interface Auftragslage {
  fortschritt: Fortschritt;
  /** Kurzlabel für Listen */
  label: string;
  /** Wer als Nächstes handeln muss */
  amZug: "kunde" | "wir" | "behoerde" | "niemand";
  naechsteAktion: string;
  /** Fahrzeug darf übergeben werden */
  fahrbereit: boolean;
  /** Für farbige Kennzeichnung in der Oberfläche */
  ton: "ok" | "warn" | "risk" | "neutral" | "accent";
}

export function bewerteAuftrag(order: StoredOrder): Auftragslage {
  const hat = (key: string) => order.timeline.some((t) => t.key === key);
  const sofort = Boolean(order.ikfz?.aktiv);

  if (order.status === "storniert") {
    return {
      fortschritt: "storniert",
      label: "Storniert",
      amZug: "niemand",
      naechsteAktion: "Vorgang wurde storniert.",
      fahrbereit: false,
      ton: "risk",
    };
  }

  if (order.vomHaendlerAngelegt && !hat("bezahlt")) {
    return {
      fortschritt: "warte_auf_kunden",
      label: "Wartet auf Kunde",
      amZug: "kunde",
      naechsteAktion: "Kundendaten ausfüllen und bezahlen — Link ist verschickt.",
      fahrbereit: false,
      ton: "warn",
    };
  }

  if (!hat("bezahlt")) {
    return {
      fortschritt: "offen",
      label: "Zahlung offen",
      amZug: "kunde",
      naechsteAktion: "Zahlung steht noch aus.",
      fahrbereit: false,
      ton: "warn",
    };
  }

  if (hat("bescheid_erteilt")) {
    if (hat("unterlagen_versandt") || hat("abgeschlossen")) {
      return {
        fortschritt: "abgeschlossen",
        label: "Abgeschlossen",
        amZug: "niemand",
        naechsteAktion: "Papiere und Plaketten sind beim Kunden.",
        fahrbereit: true,
        ton: "neutral",
      };
    }
    return {
      fortschritt: "fahrbereit",
      label: "Fahrbereit",
      amZug: "niemand",
      naechsteAktion: "Fahrzeug kann übergeben werden.",
      fahrbereit: true,
      ton: "ok",
    };
  }

  if (hat("antrag_eingereicht")) {
    return {
      fortschritt: "bei_behoerde",
      label: "Bei der Behörde",
      amZug: "behoerde",
      naechsteAktion: "Entscheidung der Zulassungsstelle abwarten.",
      fahrbereit: false,
      ton: "accent",
    };
  }

  if (sofort && hat("schilder_zugestellt") && !hat("identifiziert")) {
    return {
      fortschritt: "wartet_auf_kundenaktion",
      label: "Identifizierung offen",
      amZug: "kunde",
      naechsteAktion: "Kundin bzw. Kunde muss sich noch identifizieren.",
      fahrbereit: false,
      ton: "warn",
    };
  }

  if (sofort && hat("identifiziert") && !hat("vollmacht_signiert")) {
    return {
      fortschritt: "wartet_auf_kundenaktion",
      label: "Vollmacht offen",
      amZug: "kunde",
      naechsteAktion: "Vollmacht muss noch elektronisch signiert werden.",
      fahrbereit: false,
      ton: "warn",
    };
  }

  if (hat("schilder_versandt") && !hat("schilder_zugestellt")) {
    return {
      fortschritt: "wartet_auf_schilder",
      label: "Schilder unterwegs",
      amZug: "wir",
      naechsteAktion: "Zustellung der Kennzeichen abwarten.",
      fahrbereit: false,
      ton: "accent",
    };
  }

  return {
    fortschritt: "in_bearbeitung",
    label: "In Bearbeitung",
    amZug: "wir",
    naechsteAktion: "Unterlagen werden geprüft und der Vorgang vorbereitet.",
    fahrbereit: false,
    ton: "accent",
  };
}

/** Kurzform der Halterangaben für Listen. */
export function kundeVon(order: StoredOrder): string {
  const p = order.payload as Record<string, Record<string, string>> | undefined;
  const halter = p?.holder;
  if (!halter) return "—";
  if (halter.salutation === "firma" && halter.company) return halter.company;
  const name = `${halter.firstName ?? ""} ${halter.lastName ?? ""}`.trim();
  return name || order.email;
}

export function fahrzeugVon(order: StoredOrder): string {
  const p = order.payload as Record<string, Record<string, string>> | undefined;
  const fz = p?.vehicle;
  if (!fz) return "—";
  const bezeichnung = `${fz.make ?? ""} ${fz.model ?? ""}`.trim();
  return bezeichnung || (fz.vin ? `FIN ${fz.vin.slice(-6)}` : "—");
}

export function kennzeichenVon(order: StoredOrder): string {
  if (order.ikfz?.bescheid?.kennzeichen) return order.ikfz.bescheid.kennzeichen;
  const p = order.payload as Record<string, Record<string, string>> | undefined;
  const kz = p?.plate;
  if (!kz?.district) return "—";
  return `${kz.district}-${kz.letters ?? ""} ${kz.numbers ?? ""}`.trim();
}
