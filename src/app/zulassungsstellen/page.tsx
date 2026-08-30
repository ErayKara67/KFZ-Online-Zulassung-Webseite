import type { Metadata } from "next";
import { DistrictSearch } from "@/components/district-search";
import { CtaBand } from "@/components/sections";
import { Container, Eyebrow, H2, Lead, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Zulassungsstellen und Unterscheidungszeichen",
  description:
    "Übersicht der deutschen Zulassungsbezirke mit ihren Unterscheidungszeichen. Wunschkennzeichen für jeden Bezirk online reservieren.",
  alternates: { canonical: "/zulassungsstellen" },
};

export default function Page() {
  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-14">
          <Eyebrow>Bundesweit</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
            Zulassungsstellen und Unterscheidungszeichen
          </h1>
          <Lead>
            Das Unterscheidungszeichen richtet sich nach Ihrem Wohnsitz. Suchen
            Sie Ihren Zulassungsbezirk und starten Sie direkt mit der
            Kennzeichenreservierung.
          </Lead>
        </Container>
      </div>

      <Section tone="white" className="!pt-10">
        <DistrictSearch />
        <p className="mt-6 text-xs text-ink-500">
          Die Liste enthält die gebräuchlichsten Unterscheidungszeichen. Fehlt
          Ihr Bezirk? Melden Sie sich – wir wickeln Vorgänge bundesweit ab.
        </p>
      </Section>

      <Section tone="surface">
        <div className="max-w-3xl">
          <H2>Wie das Unterscheidungszeichen zustande kommt</H2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-700">
            <p>
              Das Unterscheidungszeichen – im Alltag „Ortskürzel“ – steht vor dem
              Siegel und bezeichnet den Zulassungsbezirk, in dem das Fahrzeug
              geführt wird. Maßgeblich ist der Wohnsitz der Halterin bzw. des
              Halters, bei Firmenfahrzeugen der Sitz des Unternehmens.
            </p>
            <p>
              Seit der Kennzeichenliberalisierung sind in vielen Landkreisen
              zusätzlich die früheren Altkennzeichen wieder wählbar. Ob das für
              Ihren Bezirk gilt, prüfen wir im Rahmen Ihres Auftrags.
            </p>
            <p>
              Bei einem Umzug innerhalb desselben Bezirks bleibt das Kennzeichen
              bestehen, es ist lediglich die Anschrift zu ändern. Bei einem Umzug
              in einen anderen Bezirk dürfen Sie das bisherige Kennzeichen auf
              Antrag mitnehmen.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
