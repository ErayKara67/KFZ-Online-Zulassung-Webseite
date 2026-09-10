export type ServiceSlug =
  | "wunschkennzeichen"
  | "kfz-zulassung"
  | "kfz-ummeldung"
  | "kfz-abmeldung"
  | "umzugsmeldung"
  | "umweltplakette";

export type FormSection =
  | "plate"
  | "vehicle"
  | "holder"
  | "insurance"
  | "sepa"
  | "documents"
  | "shipping";

export interface Service {
  slug: ServiceSlug;
  title: string;
  short: string;
  /** Bruttopreis in Cent */
  price: number;
  priceNote: string;
  badge?: string;
  icon: string;
  intro: string;
  includes: string[];
  needed: string[];
  duration: string;
  sections: FormSection[];
  seoTitle: string;
  seoDescription: string;
}

export const services: Service[] = [
  {
    slug: "wunschkennzeichen",
    title: "Wunschkennzeichen",
    short: "Reservierung + 2 Schilder",
    price: 4980,
    priceNote: "inkl. Reservierungsgebühr und Versand",
    badge: "Beliebt",
    icon: "plate",
    intro:
      "Wunschkombination prüfen, verbindlich reservieren und die fertig geprägten Schilder nach Hause liefern lassen.",
    includes: [
      "Prüfung der Kombination und Abfrage bei Ihrer Zulassungsbehörde",
      "Reservierung bei Ihrer Zulassungsbehörde",
      "2 geprägte Aluminium-Schilder nach DIN 74069",
      "Versand mit Sendungsverfolgung",
    ],
    needed: ["Wunschkombination", "Zulassungsbezirk", "Lieferanschrift"],
    duration: "Reservierung i. d. R. am selben Werktag",
    sections: ["plate", "holder", "shipping"],
    seoTitle: "Wunschkennzeichen reservieren – online prüfen und bestellen",
    seoDescription:
      "Wunschkennzeichen online auf Verfügbarkeit prüfen, direkt reservieren und die geprägten Schilder nach Hause liefern lassen.",
  },
  {
    slug: "kfz-zulassung",
    title: "Fahrzeugzulassung",
    short: "Neu- und Gebrauchtfahrzeug anmelden",
    price: 13490,
    priceNote: "inkl. aller amtlichen Gebühren",
    badge: "Komplettpaket",
    icon: "car",
    intro:
      "Neuwagen oder Gebrauchtwagen vollständig digital anmelden – inklusive Kennzeichen, Gebühren und Zulassungsbescheinigung.",
    includes: [
      "Vollständige Abwicklung mit der Zulassungsbehörde",
      "Alle amtlichen Gebühren enthalten",
      "2 geprägte Kennzeichen inkl. Plakettierung",
      "Zulassungsbescheinigung Teil I per Versand",
    ],
    needed: [
      "Zulassungsbescheinigung Teil II",
      "eVB-Nummer der Versicherung",
      "SEPA-Mandat für die Kfz-Steuer",
      "Ausweisdokument des Halters",
      "Unterschriebene Vollmacht",
    ],
    duration: "Bearbeitung in der Regel 1–3 Werktage",
    sections: [
      "plate",
      "vehicle",
      "holder",
      "insurance",
      "sepa",
      "documents",
      "shipping",
    ],
    seoTitle: "Kfz-Zulassung online – Fahrzeug digital anmelden",
    seoDescription:
      "Fahrzeug online zulassen: Wunschkennzeichen wählen, Unterlagen hochladen, Gebühren inklusive. Kennzeichen kommen per Versand.",
  },
  {
    slug: "kfz-ummeldung",
    title: "Fahrzeugummeldung",
    short: "Halterwechsel oder Umzug",
    price: 13490,
    priceNote: "inkl. aller amtlichen Gebühren",
    icon: "swap",
    intro:
      "Fahrzeug auf einen neuen Halter oder einen neuen Zulassungsbezirk ummelden – ohne Behördentermin.",
    includes: [
      "Ummeldung inkl. Kennzeichenwechsel",
      "Alle amtlichen Gebühren enthalten",
      "2 neue Kennzeichen inkl. Plakettierung",
      "Aktualisierte Zulassungsbescheinigung Teil I",
    ],
    needed: [
      "Zulassungsbescheinigung Teil I und II",
      "eVB-Nummer",
      "SEPA-Mandat",
      "Ausweisdokument",
      "Unterschriebene Vollmacht",
    ],
    duration: "Bearbeitung in der Regel 1–3 Werktage",
    sections: [
      "plate",
      "vehicle",
      "holder",
      "insurance",
      "sepa",
      "documents",
      "shipping",
    ],
    seoTitle: "Fahrzeug ummelden – online bei Halterwechsel oder Umzug",
    seoDescription:
      "Fahrzeugummeldung online beauftragen: Halterwechsel oder Umzug digital erledigen, Gebühren und neue Kennzeichen inklusive.",
  },
  {
    slug: "kfz-abmeldung",
    title: "Fahrzeugabmeldung",
    short: "Außerbetriebsetzung",
    price: 4990,
    priceNote: "inkl. aller amtlichen Gebühren",
    icon: "off",
    intro:
      "Fahrzeug außer Betrieb setzen lassen – digital beauftragt, mit amtlicher Bestätigung für Versicherung und Finanzamt.",
    includes: [
      "Außerbetriebsetzung bei der Zulassungsbehörde",
      "Alle amtlichen Gebühren enthalten",
      "Abmeldebestätigung als PDF und per Post",
      "Reservierung des Kennzeichens auf Wunsch",
    ],
    needed: [
      "Zulassungsbescheinigung Teil I",
      "Kennzeichen mit Stempelplaketten",
      "Unterschriebene Vollmacht",
    ],
    duration: "Bearbeitung in der Regel 1–2 Werktage",
    sections: ["vehicle", "holder", "documents"],
    seoTitle: "Kfz-Abmeldung online – Fahrzeug außer Betrieb setzen",
    seoDescription:
      "Fahrzeug online abmelden: Außerbetriebsetzung digital beauftragen, alle Gebühren inklusive, Bestätigung per PDF und Post.",
  },
  {
    slug: "umzugsmeldung",
    title: "Adressänderung",
    short: "Umzug im Zulassungsbezirk",
    price: 6490,
    priceNote: "inkl. aller amtlichen Gebühren",
    icon: "home",
    intro:
      "Nach einem Umzug innerhalb des Zulassungsbezirks die Halteranschrift in den Fahrzeugpapieren aktualisieren.",
    includes: [
      "Adressänderung in Zulassungsbescheinigung Teil I",
      "Alle amtlichen Gebühren enthalten",
      "Kennzeichen bleiben erhalten",
      "Rückversand der Papiere per Einschreiben",
    ],
    needed: [
      "Zulassungsbescheinigung Teil I",
      "Meldebescheinigung oder Ausweis mit neuer Anschrift",
      "Unterschriebene Vollmacht",
    ],
    duration: "Bearbeitung in der Regel 1–3 Werktage",
    sections: ["vehicle", "holder", "documents", "shipping"],
    seoTitle: "Adressänderung Fahrzeugschein – Umzug online melden",
    seoDescription:
      "Adressänderung nach Umzug online melden: neue Halteranschrift in der Zulassungsbescheinigung Teil I eintragen lassen.",
  },
  {
    slug: "umweltplakette",
    title: "Umweltplakette",
    short: "Feinstaubplakette nach Hause",
    price: 1490,
    priceNote: "inkl. Versand",
    icon: "leaf",
    intro:
      "Grüne Feinstaubplakette für Umweltzonen bestellen – anhand Ihrer Fahrzeugdaten geprüft und fertig beschriftet geliefert.",
    includes: [
      "Prüfung der Schadstoffgruppe",
      "Amtlich zugelassene Plakette",
      "Beschriftung mit Ihrem Kennzeichen",
      "Versand als Brief",
    ],
    needed: ["Kennzeichen", "Schlüsselnummern aus der Zulassungsbescheinigung"],
    duration: "Versand am nächsten Werktag",
    sections: ["vehicle", "holder", "shipping"],
    seoTitle: "Umweltplakette online bestellen – Feinstaubplakette",
    seoDescription:
      "Grüne Umweltplakette online bestellen: Schadstoffgruppe prüfen lassen, Plakette beschriftet per Post erhalten.",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
