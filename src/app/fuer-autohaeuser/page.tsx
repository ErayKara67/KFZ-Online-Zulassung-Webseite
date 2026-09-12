import type { Metadata } from "next";
import { ButtonLink, Card, Check, Container, Eyebrow, H2, Lead, Section } from "@/components/ui";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Für Autohäuser — Zulassungen ohne Mehraufwand",
  description:
    "Zulassungsservice für Autohäuser: Vorgang in einer Minute angelegt, Kunde füllt selbst aus, Status je Fahrzeug im Händlerzugang, Benachrichtigung sobald das Fahrzeug fahrbereit ist.",
  alternates: { canonical: "/fuer-autohaeuser" },
};

const fragen = [
  {
    frage: "Muss mein Verkäufer etwas machen?",
    antwort:
      "Vorname, Nachname, E-Mail — mehr nicht. Optional die Kommissionsnummer und das Fahrzeug, damit Sie es in der Übersicht wiederfinden. Danach ist der Verkauf raus aus dem Vorgang.",
    beleg: "Erfassungsmaske mit vier Feldern",
  },
  {
    frage: "Kann der Kunde selbst Daten eingeben?",
    antwort:
      "Ja, und das ist der Punkt. Der Kunde bekommt einen Link und trägt Halterdaten, Fahrzeugpapiere, Versicherung und Bankverbindung selbst ein. Diese Daten haben am Verkaufstisch nichts verloren — weder aus Datenschutzgründen noch aus Zeitgründen.",
    beleg: "Link per E-Mail, alternativ zum Weitergeben am Bildschirm",
  },
  {
    frage: "Kann ich mehrere Fahrzeuge verwalten?",
    antwort:
      "Ja. Alle Vorgänge Ihres Hauses in einer Liste: Kunde, Fahrzeug, Kennzeichen, Leistung, Status. Sortiert nach Eingang, durchsuchbar, mit Ihrer eigenen Referenznummer.",
    beleg: "Unbegrenzte Anzahl Vorgänge",
  },
  {
    frage: "Gibt es einen Händlerzugang?",
    antwort:
      "Ja, unter einem eigenen Zugang, getrennt von der Kundenansicht. Ihre Mitarbeiter sehen nur Vorgänge Ihres Hauses.",
    beleg: "Eigener Bereich mit Anmeldung",
  },
  {
    frage: "Sehe ich den Status jeder Zulassung?",
    antwort:
      "Ja — und zusätzlich, wer gerade am Zug ist: die Kundin oder der Kunde, wir oder die Behörde. Damit wissen Sie sofort, ob eine Verzögerung an Ihnen liegt oder nicht.",
    beleg: "Status plus nächste fällige Aktion je Vorgang",
  },
  {
    frage: "Bekomme ich eine Benachrichtigung, sobald das Fahrzeug fahrbereit ist?",
    antwort:
      "Ja, per E-Mail an Ihr Haus, sobald die Zulassung erteilt ist — mit Kennzeichen, Kundenname und Ihrer Referenz. Im Händlerzugang steht oben, wie viele Fahrzeuge gerade übergeben werden können.",
    beleg: "E-Mail an das Autohaus, nicht nur an den Kunden",
  },
];

const vorherNachher = [
  ["Termin bei der Zulassungsstelle vereinbaren", "entfällt"],
  ["Unterlagen vom Kunden einsammeln und prüfen", "Kunde lädt selbst hoch, Prüfung bei uns"],
  ["Mitarbeiter fährt zur Behörde", "entfällt"],
  ["Kennzeichen prägen lassen und abholen", "Versand direkt zum Kunden oder ins Haus"],
  ["Kunde ruft an und fragt nach dem Stand", "Status jederzeit im Händlerzugang"],
  ["Fahrzeug steht bis zur Zulassung auf dem Hof", "Übergabe am vereinbarten Termin"],
];

export default function Page() {
  return (
    <>
      <div className="glow-top relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="hatch pointer-events-none absolute inset-0 opacity-40" />
        <Container className="relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <Eyebrow>Für Autohäuser</Eyebrow>
            <h1 className="text-balance text-[2.1rem] font-bold leading-[1.04] tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
              Ihre Verkäufer verkaufen.{" "}
              <span className="text-accent-bright">Die Zulassung machen wir.</span>
            </h1>
            <Lead className="max-w-2xl">
              Ein Vorgang ist in unter einer Minute angelegt. Danach läuft alles
              ohne Ihr Haus — bis die Nachricht kommt, dass das Fahrzeug
              übergeben werden kann.
            </Lead>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/haendler" size="lg">
                Händlerzugang ansehen
              </ButtonLink>
              <ButtonLink href="/kontakt" variant="secondary" size="lg">
                Gespräch vereinbaren
              </ButtonLink>
            </div>
          </div>
        </Container>
      </div>

      {/* Was wegfällt */}
      <Section tone="raised">
        <div className="max-w-2xl">
          <Eyebrow>Wie viel Arbeit spare ich?</Eyebrow>
          <H2>Was heute anfällt — und was davon bleibt</H2>
          <Lead>
            Rechnen Sie mit Ihren eigenen Zahlen: Wie viele Fahrzeuge im Monat,
            wie viel Zeit heute je Zulassung. Die Posten links kennen Sie.
          </Lead>
        </div>

        <div className="mt-12 overflow-x-auto rounded-[var(--radius-card)] border border-line">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">Aufwand heute im Vergleich zum Zulassungsservice</caption>
            <thead>
              <tr className="bg-ground text-left">
                <th scope="col" className="px-5 py-3.5 text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Heute in Ihrem Haus
                </th>
                <th scope="col" className="px-5 py-3.5 text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-accent-bright">
                  Mit uns
                </th>
              </tr>
            </thead>
            <tbody>
              {vorherNachher.map(([vorher, nachher]) => (
                <tr key={vorher} className="border-t border-line">
                  <td className="px-5 py-4 text-ink-3 line-through decoration-ink-4">{vorher}</td>
                  <td className="px-5 py-4 font-medium text-ink">{nachher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-ink-4">
          Bewusst ohne Pauschalversprechen wie „spart 45 Minuten pro Fahrzeug“ —
          das hängt von Ihrem Bezirk und Ihren Abläufen ab. Sagen Sie uns Ihre
          Stückzahl, dann rechnen wir es gemeinsam durch.
        </p>
      </Section>

      {/* Die sieben Fragen */}
      <Section tone="base">
        <div className="max-w-2xl">
          <Eyebrow>Die Fragen aus der Praxis</Eyebrow>
          <H2>Was Entscheider wissen wollen</H2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {fragen.map((f) => (
            <Card key={f.frage} className="flex flex-col">
              <h3 className="text-lg font-bold leading-snug tracking-tight text-ink">
                {f.frage}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{f.antwort}</p>
              <p className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-xs font-medium text-ok">
                <Check className="h-4 w-4 shrink-0" />
                {f.beleg}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Ablauf */}
      <Section tone="raised">
        <div className="max-w-2xl">
          <Eyebrow>Ablauf</Eyebrow>
          <H2>Vom Kaufvertrag bis zur Übergabe</H2>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              wer: "Verkauf",
              titel: "Vorgang anlegen",
              text: "Name, E-Mail, Leistung. Unter einer Minute, direkt im Verkaufsgespräch.",
            },
            {
              wer: "Kunde",
              titel: "Daten ergänzen",
              text: "Der Kunde füllt Halter- und Fahrzeugdaten aus und bezahlt online.",
            },
            {
              wer: "Wir",
              titel: "Behördengang",
              text: "Kennzeichen reservieren, Unterlagen prüfen, Vorgang einreichen.",
            },
            {
              wer: "Ihr Haus",
              titel: "Nachricht: fahrbereit",
              text: "E-Mail mit Kennzeichen und Referenz. Fahrzeug kann übergeben werden.",
            },
          ].map((s, i) => (
            <li key={s.titel} className="rounded-[var(--radius-card)] border border-line bg-ground p-6">
              <span className="text-[0.75rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.16em] text-accent-bright">
                {s.wer}
              </span>
              <span className="mt-3 block text-3xl font-bold tabular-nums text-line-lit">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-bold tracking-tight text-ink">{s.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Offene Punkte */}
      <Section tone="base">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <Eyebrow>Ehrlich gesagt</Eyebrow>
            <H2>Was es noch nicht gibt</H2>
            <Lead>
              Damit Sie es von uns hören und nicht später selbst merken.
            </Lead>
          </div>
          <ul className="grid gap-4 self-center">
            {[
              [
                "Persönliche Mitarbeiterkonten",
                "Der Händlerzugang läuft aktuell über einen gemeinsamen Zugangscode. Für mehrere Standorte oder nachvollziehbare Protokolle bauen wir persönliche Konten mit Rollen.",
              ],
              [
                "Anbindung an Ihr Warenwirtschaftssystem",
                "Vorgänge werden derzeit von Hand angelegt. Eine Schnittstelle zu Ihrem System ist möglich, aber noch nicht gebaut.",
              ],
              [
                "Auswertungen",
                "Durchlaufzeiten und Monatsstatistiken gibt es noch nicht in der Oberfläche.",
              ],
            ].map(([titel, text]) => (
              <li key={titel} className="rounded-[var(--radius-card)] border border-line bg-card p-5">
                <h3 className="text-sm font-bold text-ink">{titel}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="accent">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-[2.4rem]">
              Einmal ausprobieren, mit einem echten Fahrzeug
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed opacity-80">
              Legen Sie einen Vorgang für das nächste verkaufte Fahrzeug an. Sie
              sehen selbst, wie viel bei Ihnen hängen bleibt — nämlich fast
              nichts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/haendler" variant="quiet" size="lg">
              Zum Händlerzugang
            </ButtonLink>
            <ButtonLink href="/kontakt" variant="outline" size="lg">
              {brand.name} kontaktieren
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
