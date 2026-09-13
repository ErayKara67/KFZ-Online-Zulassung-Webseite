import type { ReactNode } from "react";
import { Container, Eyebrow } from "./ui";

/**
 * Rechtstexte.
 *
 * Der Kopfbereich folgt bewusst demselben Muster wie Kontakt, Ratgeber und
 * Zulassungsstellen: gleiche Fläche, gleicher Innenabstand, gleiche
 * Überschriftengröße, gleiche Kategoriezeile darüber. Rechtstexte sahen vorher
 * eine Stufe kleiner aus als der Rest — das liest sich wie eine fremde Seite,
 * und ausgerechnet beim Impressum ist der Eindruck „gehört das überhaupt
 * hierher?" der falsche.
 */
export function LegalPage({
  title,
  updated,
  children,
  notice = true,
  eyebrow = "Rechtliches",
}: {
  title: string;
  updated?: string;
  children: ReactNode;
  notice?: boolean;
  eyebrow?: string;
}) {
  return (
    <>
      <div className="border-b border-line bg-card">
        <Container className="py-14 lg:py-20">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          {updated ? (
            <p className="mt-3 text-sm text-ink-2">Stand: {updated}</p>
          ) : null}
        </Container>
      </div>

      <Container className="max-w-3xl py-14">
        {notice ? (
          <p className="mb-10 rounded-lg border border-warn/25 bg-warn-veil p-4 text-sm leading-relaxed text-warn">
            <strong>Hinweis für den Betreiber:</strong> Dieser Text ist ein
            strukturierter Platzhalter. Bitte ersetzen Sie alle mit [ ] markierten
            Angaben und lassen Sie die Fassung vor dem Livegang rechtlich prüfen.
            Diese Seite ersetzt keine Rechtsberatung.
          </p>
        ) : null}

        <div className="legal space-y-6 text-sm leading-relaxed text-ink-2 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_a]:font-medium [&_a]:text-accent-bright [&_a]:underline">
          {children}
        </div>
      </Container>
    </>
  );
}
