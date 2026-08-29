import { z } from "zod";
import { getService, type ServiceSlug } from "./services";

/* ------------------------------------------------------------ Optionen */

export interface Option {
  id: string;
  label: string;
  description: string;
  price: number;
}

export const plateSizes: Option[] = [
  {
    id: "standard",
    label: "Standard 520 × 110 mm",
    description: "Passt an nahezu alle Pkw.",
    price: 0,
  },
  {
    id: "kurz",
    label: "Kurzkennzeichen 460 × 110 mm",
    description: "Für schmale Kennzeichenmulden.",
    price: 0,
  },
  {
    id: "zweizeilig",
    label: "Zweizeilig 340 × 200 mm",
    description: "Für Transporter, Anhänger und Geländewagen.",
    price: 490,
  },
  {
    id: "motorrad",
    label: "Motorrad 220 × 200 mm",
    description: "Zweizeilig, für Krafträder.",
    price: 490,
  },
];

export const extras: Option[] = [
  {
    id: "drittes-schild",
    label: "Drittes Kennzeichen",
    description: "Für Fahrradträger oder Anhänger.",
    price: 1490,
  },
  {
    id: "halter",
    label: "Kennzeichenhalter-Set",
    description: "Zwei Halter inkl. Montagematerial, ohne Fremdwerbung.",
    price: 990,
  },
  {
    id: "express",
    label: "Express-Bearbeitung",
    description: "Vorrangige Bearbeitung, Einreichung am nächsten Werktag.",
    price: 1990,
  },
  {
    id: "reservierung-verlaengern",
    label: "Verlängerte Reservierung",
    description: "Reservierung wird vor Ablauf einmalig verlängert.",
    price: 990,
  },
];

export const shippingOptions: Option[] = [
  {
    id: "standard",
    label: "Standardversand (DHL GoGreen)",
    description: "1–2 Werktage, mit Sendungsverfolgung.",
    price: 0,
  },
  {
    id: "express",
    label: "Expressversand",
    description: "Zustellung am nächsten Werktag bis 12 Uhr.",
    price: 1290,
  },
];

/* ------------------------------------------------------------- Schemata */

const nonEmpty = (msg: string) => z.string().trim().min(1, msg);

export const plateSchema = z.object({
  district: nonEmpty("Bitte Ortskürzel angeben").max(3),
  letters: nonEmpty("Bitte Buchstaben angeben").max(2),
  numbers: nonEmpty("Bitte Zahlen angeben").max(4),
  size: z.string().default("standard"),
});

export const vehicleSchema = z.object({
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "Die FIN besteht aus 17 Zeichen (ohne I, O, Q)"),
  zbTeil2: nonEmpty("Bitte Nummer der Zulassungsbescheinigung Teil II angeben"),
  make: nonEmpty("Bitte Hersteller angeben"),
  model: nonEmpty("Bitte Modell angeben"),
  firstRegistration: z.string().optional(),
  huUntil: z.string().optional(),
  previousPlate: z.string().optional(),
});

export const holderSchema = z.object({
  salutation: z.enum(["frau", "herr", "divers", "firma"]),
  company: z.string().optional(),
  firstName: nonEmpty("Bitte Vorname angeben"),
  lastName: nonEmpty("Bitte Nachname angeben"),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  street: nonEmpty("Bitte Straße und Hausnummer angeben"),
  zip: z.string().trim().regex(/^[0-9]{5}$/, "Bitte gültige Postleitzahl angeben"),
  city: nonEmpty("Bitte Ort angeben"),
  email: z.string().trim().email("Bitte gültige E-Mail-Adresse angeben"),
  phone: nonEmpty("Bitte Telefonnummer für Rückfragen angeben"),
});

export const insuranceSchema = z.object({
  evb: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{7}$/, "Die eVB-Nummer besteht aus 7 Zeichen"),
  insurer: z.string().optional(),
});

export const sepaSchema = z.object({
  accountHolder: nonEmpty("Bitte Kontoinhaber angeben"),
  iban: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^DE[0-9]{20}$/.test(v), "Bitte gültige deutsche IBAN angeben"),
  mandate: z.literal(true, {
    message: "Bitte bestätigen Sie das SEPA-Lastschriftmandat für die Kfz-Steuer",
  }),
});

export const documentsSchema = z.object({
  powerOfAttorney: z.literal(true, {
    message: "Ohne Vollmacht können wir den Vorgang nicht einreichen",
  }),
  signature: nonEmpty("Bitte unterschreiben Sie die Vollmacht mit Ihrem Namen"),
});

export const shippingSchema = z.object({
  method: z.string().default("standard"),
  differentAddress: z.boolean().default(false),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
});

export const legalSchema = z.object({
  terms: z.literal(true, { message: "Bitte AGB und Widerrufsbelehrung bestätigen" }),
  privacy: z.literal(true, { message: "Bitte Datenschutzhinweise bestätigen" }),
});

/* --------------------------------------------------------- Preisberechnung */

export interface PriceLine {
  label: string;
  amount: number;
}

export interface OptionSelection {
  service: ServiceSlug;
  plateSize?: string;
  extras?: string[];
  shipping?: string;
}

export function priceLines(selection: OptionSelection): PriceLine[] {
  const service = getService(selection.service);
  const lines: PriceLine[] = [];
  if (!service) return lines;

  lines.push({ label: service.title, amount: service.price });

  const size = plateSizes.find((s) => s.id === selection.plateSize);
  if (size && size.price > 0) {
    lines.push({ label: size.label, amount: size.price });
  }

  for (const id of selection.extras ?? []) {
    const extra = extras.find((e) => e.id === id);
    if (extra) lines.push({ label: extra.label, amount: extra.price });
  }

  const shipping = shippingOptions.find((s) => s.id === selection.shipping);
  if (shipping && shipping.price > 0) {
    lines.push({ label: shipping.label, amount: shipping.price });
  }

  return lines;
}

export function totalCents(selection: OptionSelection): number {
  return priceLines(selection).reduce((sum, line) => sum + line.amount, 0);
}

/** Brutto → enthaltene Umsatzsteuer (19 %) */
export function vatOf(gross: number): number {
  return Math.round(gross - gross / 1.19);
}

/* ----------------------------------------------------------- Bestelldaten */

export const orderSchema = z.object({
  service: z.string(),
  plate: plateSchema.partial().optional(),
  vehicle: vehicleSchema.partial().optional(),
  holder: holderSchema,
  insurance: insuranceSchema.partial().optional(),
  sepa: sepaSchema.partial().optional(),
  documents: documentsSchema.partial().optional(),
  shipping: shippingSchema.partial().optional(),
  extras: z.array(z.string()).default([]),
  plateSize: z.string().default("standard"),
  shippingMethod: z.string().default("standard"),
  legal: legalSchema,
  note: z.string().max(2000).optional(),
});

export type OrderPayload = z.infer<typeof orderSchema>;

export function makeOrderId(): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `KP-${stamp}-${rand}`;
}
