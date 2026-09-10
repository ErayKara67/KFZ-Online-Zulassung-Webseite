import Stripe from "stripe";

/**
 * Stripe-Client. Ist kein Schlüssel gesetzt, läuft die Anwendung im
 * Demo-Modus: Bestellungen werden angelegt, aber keine echte Zahlung
 * ausgelöst. Siehe README, Abschnitt „Zahlungen“.
 */
export const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt.");
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

export function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
