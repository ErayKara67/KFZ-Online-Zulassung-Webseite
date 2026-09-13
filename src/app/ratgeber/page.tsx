import type { Metadata } from "next";
import { CtaBand } from "@/components/sections";
import { ButtonLink, Card, Check, Container, Eyebrow, H2, Lead, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Ratgeber und Checklisten",
  description:
    "Checklisten und Erklärungen rund um Zulassung, Ummeldung, Abmeldung, eVB-Nummer und Wunschkennzeichen.",
  alternates: { canonical: "/ratgeber" },
};

const guides = [
  {
    id: "zulassung",
    title: "Fahrzeug zulassen – die Unterlagen",
    intro:
      "Ohne vollständige Unterlagen weist die Zulassungsstelle den Vorgang zurück. Diese Liste deckt den Regelfall ab.",
    points: [
      "Zulassungsbescheinigung Teil II (früher Fahrzeugbrief)",
      "Bei Gebrauchtfahrzeugen zusätzlich Teil I und HU-Bericht",
      "Gültige eVB-Nummer der Kfz-Versicherung",
      "SEPA-Mandat für den Einzug der Kfz-Steuer",
      "Ausweisdokument der Halterin bzw. des Halters",
      "Bei Firmen: Handelsregisterauszug und Gewerbeanmeldung",
      "Unterschriebene Vollmacht für die Abwicklung",
    ],
  },
  {
    id: "evb",
    title: "Was ist die eVB-Nummer?",
    intro:
      "Die elektronische Versicherungsbestätigung ist der Nachweis, dass für das Fahrzeug Versicherungsschutz besteht.",
    points: [
      "Siebenstellige Kombination aus Buchstaben und Ziffern",
      "Wird von der Kfz-Versicherung kostenlos ausgestellt",
      "Meist innerhalb weniger Minuten per E-Mail oder SMS verfügbar",
      "Gültigkeit ist begrenzt – häufig wenige Wochen",
      "Ohne eVB ist keine Zulassung und keine Ummeldung möglich",
    ],
  },
  {
    id: "wunschkennzeichen",
    title: "Regeln für Wunschkennzeichen",
    intro:
      "Der Aufbau eines Kennzeichens ist bundesweit einheitlich geregelt. Diese Grenzen sollten Sie kennen.",
    points: [
      "Unterscheidungszeichen: 1 bis 3 Buchstaben, abhängig vom Wohnsitz",
      "Erkennungsnummer: 1 bis 2 Buchstaben und 1 bis 4 Ziffern",
      "Insgesamt höchstens 8 Zeichen",
      "Der Zahlenteil darf nicht mit einer Null beginnen",
      "Kombinationen mit verfassungsfeindlichem Bezug werden nicht vergeben",
      "Die Reservierung gilt je nach Bezirk 30 bis 90 Tage",
    ],
  },
  {
    id: "abmeldung",
    title: "Fahrzeug abmelden – worauf achten",
    intro:
      "Die Außerbetriebsetzung beendet die Versicherungs- und Steuerpflicht. Danach darf das Fahrzeug nicht mehr im öffentlichen Verkehr bewegt werden.",
    points: [
      "Zulassungsbescheinigung Teil I und Kennzeichen mit Plaketten einreichen",
      "Das Kennzeichen kann auf Wunsch reserviert werden",
      "Versicherung und Hauptzollamt werden automatisch informiert",
      "Zu viel gezahlte Kfz-Steuer wird anteilig erstattet",
      "Die Abmeldebestätigung sollte aufbewahrt werden",
    ],
  },
  {
    id: "umzug",
    title: "Umzug: ummelden oder nur Adresse ändern?",
    intro:
      "Ob ein neues Kennzeichen nötig ist, hängt davon ab, ob Sie den Zulassungsbezirk wechseln.",
    points: [
      "Umzug innerhalb des Bezirks: nur Adressänderung in Teil I",
      "Umzug in einen anderen Bezirk: Ummeldung erforderlich",
      "Das bisherige Kennzeichen darf auf Antrag mitgenommen werden",
      "Die Änderung ist unverzüglich vorzunehmen – sonst droht ein Bußgeld",
      "Halterwechsel und Umzug lassen sich in einem Vorgang erledigen",
    ],
  },
  {
    id: "umweltplakette",
    title: "Umweltzonen und Feinstaubplakette",
    intro:
      "In vielen Innenstädten ist die Einfahrt nur mit gültiger Plakette erlaubt.",
    points: [
      "Die Schadstoffgruppe ergibt sich aus der Emissionsschlüsselnummer",
      "Nahezu alle Umweltzonen setzen die grüne Plakette voraus",
      "Die Plakette wird an der Innenseite der Frontscheibe angebracht",
      "Sie ist an das Kennzeichen gebunden und unbefristet gültig",
      "Bei Kennzeichenwechsel ist eine neue Plakette erforderlich",
    ],
  },
];

export default function Page() {
  return (
    <>
      <div className="border-b border-line bg-card">
        <Container className="py-14 lg:py-20">
          <Eyebrow>Ratgeber</Eyebrow>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Checklisten für jeden Zulassungsvorgang
          </h1>
          <Lead>
            Kurz, konkret und aus der täglichen Praxis mit Zulassungsbehörden.
            Wenn etwas unklar bleibt, rufen Sie uns einfach an.
          </Lead>
        </Container>
      </div>

      <Section tone="raised">
        <nav aria-label="Übersicht" className="mb-10 flex flex-wrap gap-2">
          {guides.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm font-medium text-ink-2 hover:border-accent hover:text-accent-bright"
            >
              {g.title}
            </a>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-2">
          {guides.map((g) => (
            <Card key={g.id} className="scroll-mt-28" >
              <h2 id={g.id} className="scroll-mt-28 text-xl font-semibold text-ink">
                {g.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{g.intro}</p>
              <ul className="mt-5 space-y-2.5">
                {g.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm text-ink-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="base">
        <div className="max-w-2xl">
          <H2>Unsicher, welcher Vorgang der richtige ist?</H2>
          <Lead>
            Schildern Sie uns kurz Ihre Situation – wir sagen Ihnen, welche
            Leistung passt und welche Unterlagen Sie bereithalten sollten.
          </Lead>
          <ButtonLink href="/kontakt" className="mt-8" size="lg">
            Kostenlos beraten lassen
          </ButtonLink>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
