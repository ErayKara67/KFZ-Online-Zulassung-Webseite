import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderWizard } from "@/components/checkout/order-wizard";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Auftrag erteilen",
  description:
    "Zulassungsvorgang online beauftragen: Kennzeichen wählen, Fahrzeug- und Halterdaten angeben, Unterlagen hochladen und sicher bezahlen.",
  robots: { index: false, follow: true },
};

export default function OrderPage() {
  return (
    <div className="bg-card">
      <div className="border-b border-line bg-card">
        <Container className="py-10 sm:py-12">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-accent-bright sm:text-[0.7rem]">
            Bestellung
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Auftrag erteilen
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">
            In wenigen Minuten ausgefüllt. Ihre Eingaben werden verschlüsselt
            übertragen und nur zur Abwicklung des Vorgangs verwendet.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <Suspense
          fallback={
            <p className="py-20 text-center text-sm text-ink-2">Formular wird geladen …</p>
          }
        >
          <OrderWizard />
        </Suspense>
      </Container>
    </div>
  );
}
