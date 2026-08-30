/**
 * Zentrale Stammdaten der Website.
 * ALLE Werte hier sind PLATZHALTER und müssen vor dem Livegang
 * durch die echten Angaben ersetzt werden.
 */
export const site = {
  name: "Kfz-Portal24",
  claim: "Wunschkennzeichen reservieren & Fahrzeug online zulassen",
  domain: "www.kfz-portal24.de",
  url: "https://www.kfz-portal24.de",

  company: {
    legalName: "Musterfirma Digital GmbH", // PLATZHALTER
    street: "Musterstraße 1", // PLATZHALTER
    zip: "12345", // PLATZHALTER
    city: "Musterstadt", // PLATZHALTER
    country: "Deutschland",
    register: "Amtsgericht Musterstadt, HRB 00000", // PLATZHALTER
    vatId: "DE000000000", // PLATZHALTER
    ceo: "Max Mustermann", // PLATZHALTER
  },

  contact: {
    phone: "+49 (0) 000 000000", // PLATZHALTER
    phoneHref: "+49000000000", // PLATZHALTER
    email: "service@kfz-portal24.de", // PLATZHALTER
    hours: "Mo–Fr 08:00–17:00 Uhr",
  },

  shipping: {
    carrier: "DHL GoGreen",
    cutoff: "Mo–Do bis 14:30 Uhr, Fr bis 13:30 Uhr",
    note: "Versand am selben Werktag bei Bestellung vor Annahmeschluss.",
  },

  /**
   * PLATZHALTER: Zertifikate und Bewertungen dürfen nur angezeigt werden,
   * wenn sie tatsächlich vorliegen. Bis dahin bleibt `enabled` auf false.
   */
  trust: {
    certification: {
      enabled: false,
      label: "DIN 74069 zertifizierte Schilderproduktion",
      registration: "Reg.-Nr. hier eintragen", // PLATZHALTER
    },
    reviews: {
      enabled: false,
      provider: "Bewertungsportal", // PLATZHALTER
      rating: "0,0",
      count: "0",
    },
  },
} as const;

export type Site = typeof site;
