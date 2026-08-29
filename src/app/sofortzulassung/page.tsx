import type { Metadata } from "next";
import { CtaBand } from "@/components/sections";
import {
  ButtonLink,
  Card,
  Check,
  Container,
  Eyebrow,
  H2,
  Lead,
  Section,
} from "@/components/ui";
import { formatPrice } from "@/lib/services";
import { sofortzulassungOption } from "@/lib/order";
import {
  NACHWEIS_GUELTIGKEIT_TAGE,
  ABRUFFENSTER_MINUTEN,
  STICHTAG_ZB1,
  STICHTAG_ZB2,
} from "@/lib/ikfz/eligibility";

export const metadata: Metadata = {
  title: "Sofortzulassung nach i-Kfz Stufe 4 – direkt losfahren",
  description:
    "Fahrzeug online zulassen und sofort losfahren: Mit dem vorläufigen Zulassungsnachweis aus dem i-Kfz-Verfahren dürfen Sie zehn Tage fahren, während Papiere und Plaketten per Post kommen.",
  alternates: { canonical: "/sofortzulassung" },
};

const stichtag = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const ablauf = [
  {
    titel: "Kennzeichen sichern und beauftragen",
    text: "Sie prüfen Ihre Wunschkombination, buchen die Sofortzulassung und geben Fahrzeug- sowie Halterdaten ein.",
  },
  {
    titel: "Schilder kommen per Express",
    text: "Wir prägen sofort und liefern vorab. Das ist der entscheidende Schritt: Ohne montierte Schilder darf auch mit Bescheid nicht gefahren werden.",
  },
  {
    titel: "Identifizierung in wenigen Minuten",
    text: "Mit der Online-Ausweisfunktion oder über unseren Identifizierungspartner. Firmen nutzen ihr ELSTER-Unternehmenskonto.",
  },
  {
    titel: "Antrag geht digital an die Behörde",
    text: "Sobald Schilder und Identität vorliegen, reichen wir ein. Die Entscheidung erfolgt automatisiert.",
  },
  {
    titel: "Nachweis herunterladen und losfahren",
    text: `Der vorläufige Zulassungsnachweis steht sofort bereit. Ausdrucken, sichtbar ins Fahrzeug legen, Schilder montieren – fertig.`,
  },
  {
    titel: "Papiere und Plaketten kommen per Post",
    text: "Zulassungsbescheinigung und Plakettenträger schickt die Behörde. Nach Erhalt bringen Sie die Plaketten an.",
  },
];

export default function Page() {
  return (
    <>
      <div className="relative overflow-hidden border-b border-line bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_28rem_at_80%_-15%,var(--color-brand-50),transparent)]"
        />
        <Container className="relative grid gap-12 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-ok-100 px-3 py-1.5 text-xs font-semibold text-ok-700">
              <span className="h-2 w-2 rounded-full bg-ok-700" aria-hidden="true" />
              i-Kfz Stufe 4 · automatisierte Entscheidung
            </p>

            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl">
              Zulassen und <span className="text-brand-700">am selben Tag losfahren</span>
            </h1>

            <Lead>
              Die internetbasierte Fahrzeugzulassung erlaubt die sofortige
              Inbetriebsetzung: Nach dem Bescheid dürfen Sie{" "}
              {NACHWEIS_GUELTIGKEIT_TAGE} Kalendertage fahren, während
              Zulassungsbescheinigung und Plaketten noch unterwegs sind.
            </Lead>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/bestellung?leistung=kfz-zulassung&sofort=1" size="lg">
                Sofortzulassung beauftragen
              </ButtonLink>
              <ButtonLink href="#voraussetzungen" variant="secondary" size="lg">
                Voraussetzungen prüfen
              </ButtonLink>
            </div>

            <p className="mt-6 text-sm text-ink-500">
              Aufpreis {formatPrice(sofortzulassungOption.price)} inklusive
              Express-Vorabversand der Schilder.
            </p>
          </div>

          <Card className="bg-surface">
            <h2 className="text-base font-semibold text-ink-900">
              Was der vorläufige Zulassungsnachweis leistet
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-ink-700">
              {[
                `Fahrberechtigung für ${NACHWEIS_GUELTIGKEIT_TAGE} Kalendertage ab Erlass des Bescheids`,
                "Kennzeichenschilder dürfen in dieser Zeit noch ungesiegelt sein",
                "Nachweis wird ausgedruckt und sichtbar im Fahrzeug angebracht",
                "Zulassungsbescheid und Zulassungsbescheinigung Teil I sind mitzuführen",
                "Nach Erhalt der Plaketten sind diese unverzüglich anzubringen",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-lg bg-white p-4 text-xs leading-relaxed text-ink-500">
              Der Bescheid muss innerhalb von {ABRUFFENSTER_MINUTEN} Minuten
              abgerufen werden. Wir übernehmen den Abruf automatisch und legen
              Ihnen die Dokumente in die Auftragsverfolgung – zusätzlich gehen
              sie per E-Mail an Sie raus.
            </p>
          </Card>
        </Container>
      </div>

      <Section tone="surface">
        <div className="max-w-2xl">
          <Eyebrow>Ablauf</Eyebrow>
          <H2>Sechs Schritte bis zur ersten Fahrt</H2>
          <Lead>
            Die Reihenfolge ist nicht beliebig – deshalb liefern wir die Schilder
            vor dem Zulassungsantrag.
          </Lead>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ablauf.map((s, i) => (
            <li
              key={s.titel}
              className="relative rounded-[var(--radius-card)] border border-line bg-white p-6"
            >
              <span className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-brand-800 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{s.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white" id="voraussetzungen">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Voraussetzungen</Eyebrow>
            <H2>Das muss vorliegen</H2>
            <ul className="mt-6 space-y-3">
              {[
                [
                  "Fahrzeugpapiere mit Sicherheitscode",
                  `Zulassungsbescheinigung Teil II ab ${stichtag(STICHTAG_ZB2)}, Teil I ab ${stichtag(STICHTAG_ZB1)}. Ältere Papiere tragen keinen Code.`,
                ],
                [
                  "Elektronische Identifizierung",
                  "Online-Ausweisfunktion mit PIN, ein Vertrauensdiensteanbieter oder – bei Firmen – das ELSTER-Unternehmenskonto.",
                ],
                [
                  "Gültige Hauptuntersuchung",
                  "Bei Gebrauchtfahrzeugen muss die HU zum Zeitpunkt der Zulassung gültig sein.",
                ],
                [
                  "eVB-Nummer und SEPA-Mandat",
                  "Versicherungsbestätigung und Einzugsermächtigung für die Kfz-Steuer sind zwingend.",
                ],
                [
                  "Kennzeichenschilder vor Fahrtantritt",
                  "Wir liefern sie vorab per Express. Ohne montierte Schilder gilt die Fahrberechtigung nicht.",
                ],
              ].map(([titel, text]) => (
                <li key={titel} className="rounded-lg border border-line bg-surface p-5">
                  <h3 className="text-sm font-semibold text-ink-900">{titel}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Eyebrow>Grenzen des Verfahrens</Eyebrow>
            <H2>Wann es nicht funktioniert</H2>
            <ul className="mt-6 space-y-3">
              {[
                [
                  "Papiere ohne Sicherheitscode",
                  "Fahrzeugdokumente von vor den Stichtagen lassen sich nicht automatisiert prüfen.",
                ],
                [
                  "Sonderkennzeichen",
                  "Kurzzeit-, Ausfuhr- und rote Kennzeichen sind vom Verfahren ausgenommen.",
                ],
                [
                  "Fehlende oder abgelaufene HU",
                  "Ohne gültige Hauptuntersuchung entscheidet die Behörde nicht automatisiert.",
                ],
                [
                  "Offene Gebühren oder Steuerrückstände",
                  "Rückstände führen zur Ablehnung des Antrags.",
                ],
              ].map(([titel, text]) => (
                <li key={titel} className="rounded-lg border border-line p-5">
                  <h3 className="text-sm font-semibold text-ink-900">{titel}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{text}</p>
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-lg bg-brand-50 p-5 text-sm leading-relaxed text-brand-900">
              Trifft einer dieser Punkte zu, wickeln wir den Vorgang klassisch mit
              Vollmacht ab. Den Aufpreis für die Sofortzulassung berechnen wir
              dann nicht.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
