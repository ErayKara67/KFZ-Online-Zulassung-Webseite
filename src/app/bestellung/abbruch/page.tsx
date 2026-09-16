import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Zahlung abgebrochen",
  robots: { index: false, follow: false },
};

/**
 * Landeseite nach Abbruch auf der Bezahlseite.
 *
 * Wichtig ist hier genau eine Sache: ein Weg zurück zum bestehenden Auftrag.
 * Die frühere Fassung verlinkte auf /bestellung — das startet aber einen neuen,
 * leeren Assistenten. Wer darauf klickte, füllte alles noch einmal aus und legte
 * am Ende einen zweiten Auftrag an.
 */
export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ auftrag?: string; code?: string }>;
}) {
  const { auftrag, code } = await searchParams;
  const zurueck = auftrag && code ? `/auftrag/${auftrag}?code=${code}` : null;

  return (
    <>
      <div className="border-b border-line bg-card">
        <Container className="py-10 sm:py-12">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-accent-bright sm:text-[0.7rem]">
            Bestellung
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Die Zahlung wurde abgebrochen
          </h1>
          {auftrag ? (
            <p className="mt-3 text-sm text-ink-2">
              Auftragsnummer{" "}
              <span className="font-semibold text-ink">{auftrag}</span>
            </p>
          ) : null}
        </Container>
      </div>

      <Container className="max-w-2xl py-12">
        <p className="text-lg leading-relaxed text-ink-2">
          Es wurde nichts abgebucht. Ihre Angaben sind gespeichert — Sie müssen
          nichts erneut ausfüllen und können die Zahlung jederzeit fortsetzen.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {zurueck ? (
            <ButtonLink href={zurueck} size="lg">
              Zahlung fortsetzen
            </ButtonLink>
          ) : (
            <ButtonLink href="/bestellung" size="lg">
              Neuen Auftrag beginnen
            </ButtonLink>
          )}
          <ButtonLink href="/kontakt" variant="secondary" size="lg">
            Hilfe anfordern
          </ButtonLink>
        </div>

        {zurueck ? (
          <p className="mt-6 text-sm leading-relaxed text-ink-3">
            Den Link zu Ihrem Vorgang haben wir Ihnen auch per E-Mail geschickt.
            Sie können also später weitermachen, ohne diese Seite offen zu
            halten.
          </p>
        ) : null}

        <div className="mt-10 rounded-[var(--radius-card)] border border-line bg-card p-6">
          <h2 className="text-base font-bold text-ink">
            Hat bei der Zahlung etwas nicht geklappt?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Manchmal lehnt die Bank eine Zahlung ohne erkennbaren Grund ab, oder
            die Bestätigung im Banking-Programm läuft ab. Ein zweiter Versuch
            hilft meistens. Wenn nicht, rufen Sie uns an — wir finden einen
            anderen Weg.
          </p>
          <p className="mt-4 text-sm text-ink-2">
            {site.contact.phone} · {site.contact.hours}
          </p>
        </div>
      </Container>
    </>
  );
}
