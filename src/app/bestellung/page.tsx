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
    <div className="bg-white">
      <div className="border-b border-line bg-surface">
        <Container className="py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Auftrag erteilen
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
            In wenigen Minuten ausgefüllt. Ihre Eingaben werden verschlüsselt
            übertragen und nur zur Abwicklung des Vorgangs verwendet.
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <Suspense
          fallback={
            <p className="py-20 text-center text-sm text-ink-500">Formular wird geladen …</p>
          }
        >
          <OrderWizard />
        </Suspense>
      </Container>
    </div>
  );
}
