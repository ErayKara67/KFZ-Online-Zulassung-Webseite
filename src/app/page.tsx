import type { Metadata } from "next";
import { PlateChecker } from "@/components/plate-checker";
import {
  BenefitsSection,
  CtaBand,
  DistrictsSection,
  ExplainerSection,
  FaqSection,
  ServicesSection,
  SofortSection,
  StepsSection,
  TrustBar,
  faqItems,
} from "@/components/sections";
import { ButtonLink, Container } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} – ${site.claim}`,
  description:
    "Wunschkennzeichen kostenlos prüfen, direkt reservieren und das Fahrzeug online zulassen, ummelden oder abmelden. Festpreis inklusive aller amtlichen Gebühren.",
  alternates: { canonical: "/" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-line bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_15%_-10%,var(--color-brand-50),transparent)]"
        />
        <Container className="relative grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-700">
              <span className="h-2 w-2 rounded-full bg-ok-700" aria-hidden="true" />
              Neu: Sofortzulassung nach i-Kfz Stufe 4 – am selben Tag losfahren
            </p>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl">
              Wunschkennzeichen sichern und das Fahrzeug{" "}
              <span className="text-brand-700">online zulassen</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-500">
              Kombination prüfen, Auftrag digital erteilen, Kennzeichen und
              Papiere per Post erhalten. Ohne Termin, ohne Wartezimmer, zum
              Festpreis inklusive aller amtlichen Gebühren.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#pruefer" size="lg">
                Verfügbarkeit prüfen
              </ButtonLink>
              <ButtonLink href="/sofortzulassung" variant="secondary" size="lg">
                Sofortzulassung ansehen
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                ["Alle", "Zulassungsbezirke"],
                ["1–3", "Werktage Bearbeitung"],
                ["0 €", "für die Verfügbarkeitsprüfung"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block text-2xl font-semibold text-ink-900">{value}</span>
                    <span className="mt-1 block text-xs leading-snug text-ink-500">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div id="pruefer" className="scroll-mt-28">
            <PlateChecker />
          </div>
        </Container>
      </div>

      <TrustBar />
      <SofortSection />
      <StepsSection />
      <ServicesSection />
      <ExplainerSection />
      <BenefitsSection />
      <DistrictsSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
