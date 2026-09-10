import type { Metadata } from "next";
import { PlateChecker } from "@/components/plate-checker";
import {
  AutohausSection,
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
import { ButtonLink, Container, Stat } from "@/components/ui";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${brand.name} Zulassungsservice — Fahrzeug online zulassen`,
  description:
    "Wunschkennzeichen prüfen, Fahrzeug online zulassen und zum Übergabetermin fahrbereit übernehmen. Festpreis inklusive aller amtlichen Gebühren.",
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

      {/* Auftakt */}
      <div className="glow-top relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="hatch pointer-events-none absolute inset-0 opacity-40"
        />
        <Container className="relative grid gap-14 py-16 lg:grid-cols-[1fr_27rem] lg:items-start lg:py-24">
          <div className="max-w-2xl">
            <p className="flex w-fit max-w-full items-center gap-2.5 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
              Zulassungsservice für Kundinnen und Kunden von {brand.name}
            </p>

            <h1 className="mt-7 text-balance text-[2.1rem] font-bold leading-[1.04] tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
              Ihr neues Fahrzeug.{" "}
              <span className="text-accent-bright">Angemeldet, bevor Sie es abholen.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              Wunschkennzeichen aussuchen, Zulassung online beauftragen, zur
              Übergabe einsteigen und losfahren. Ohne Behördentermin, ohne
              Wartezimmer, zum Festpreis inklusive aller amtlichen Gebühren.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="#pruefer" size="lg">
                Kennzeichen aussuchen
              </ButtonLink>
              <ButtonLink href="/sofortzulassung" variant="secondary" size="lg">
                Sofortzulassung ansehen
              </ButtonLink>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-8 border-t border-line pt-9">
              <Stat value="14" label="Tage fahren ohne Plaketten" />
              <Stat value="1–3" label="Werktage Bearbeitung" />
              <Stat value="0 €" label="für Prüfung und Beratung" />
            </dl>
          </div>

          <div id="pruefer" className="scroll-mt-28 lg:sticky lg:top-28">
            <PlateChecker />
          </div>
        </Container>
      </div>

      <TrustBar />
      <AutohausSection />
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
