import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { getStripe, stripeConfigured } from "@/lib/stripe";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Auftrag eingegangen",
  robots: { index: false, follow: false },
};

/**
 * Landeseite nach der Bezahlung.
 *
 * Die Seite fragt den Zahlungsstand bei Stripe ab, statt Erfolg zu behaupten.
 * Bei Lastschrift und Klarna ist zum Zeitpunkt der Rückkehr nämlich noch kein
 * Geld geflossen — ein grüner Haken mit „Vielen Dank" wäre dann schlicht
 * falsch, und der Kunde wunderte sich später über die Nachfrage.
 */
type Zahlungslage = "bezahlt" | "ausstehend" | "unbekannt";

async function zahlungslage(sessionId?: string): Promise<Zahlungslage> {
  if (!sessionId || !stripeConfigured) return "unbekannt";
  try {
    const sitzung = await getStripe().checkout.sessions.retrieve(sessionId);
    return sitzung.payment_status === "paid" ||
      sitzung.payment_status === "no_payment_required"
      ? "bezahlt"
      : "ausstehend";
  } catch (fehler) {
    console.error("[erfolg] Zahlungsstand nicht abrufbar", fehler);
    return "unbekannt";
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    auftrag?: string;
    demo?: string;
    code?: string;
    session?: string;
  }>;
}) {
  const { auftrag, demo, code, session } = await searchParams;
  const lage = demo ? "bezahlt" : await zahlungslage(session);

  const ueberschrift =
    lage === "ausstehend"
      ? "Ihr Auftrag ist eingegangen"
      : "Vielen Dank – Ihr Auftrag ist eingegangen";

  return (
    <>
      <div className="border-b border-line bg-card">
        <Container className="py-10 sm:py-12">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-accent-bright sm:text-[0.7rem]">
            Bestellung abgeschlossen
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {ueberschrift}
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
        {/* Zahlungsstand — steht bewusst zuerst */}
        {lage === "ausstehend" ? (
          <div className="rounded-[var(--radius-card)] border-2 border-warn/35 bg-warn-veil p-6">
            <h2 className="text-lg font-bold text-warn">
              Ihre Zahlung ist angestoßen
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Bei Lastschrift und Klarna bestätigt die Bank die Zahlung nicht
              sofort — das dauert üblicherweise ein bis zwei Werktage. Wir
              beginnen mit der Bearbeitung, sobald die Bestätigung vorliegt, und
              melden uns per E-Mail. Sie müssen nichts weiter tun.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-4 rounded-[var(--radius-card)] border-2 border-ok/30 bg-ok-veil p-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ok/15 text-ok">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12.5 4.5 4.5L19 7" />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-bold text-ok">Zahlung eingegangen</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                Wir haben Ihren Auftrag erfasst und beginnen mit der Bearbeitung.
              </p>
            </div>
          </div>
        )}

        {demo ? (
          <p className="mt-6 rounded-[var(--radius-sm)] border border-warn/25 bg-warn-veil p-4 text-[0.8125rem] leading-relaxed text-warn sm:text-sm">
            <strong>Demo-Modus:</strong> Es wurde keine echte Zahlung ausgelöst,
            weil noch kein Zahlungsdienstleister hinterlegt ist. Der Auftrag
            wurde aber vollständig gespeichert und die Benachrichtigungen wurden
            erzeugt.
          </p>
        ) : null}

        {auftrag && code ? (
          <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-card p-6">
            <h2 className="text-base font-bold text-ink">Auftrag verfolgen</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Über diesen Link sehen Sie jederzeit den Bearbeitungsstand,
              erledigen Ihre Identifizierung und laden — bei der Sofortzulassung
              — den vorläufigen Zulassungsnachweis herunter. Bewahren Sie ihn
              auf; wir haben ihn Ihnen auch per E-Mail geschickt.
            </p>
            <ButtonLink href={`/auftrag/${auftrag}?code=${code}`} className="mt-5">
              Zur Auftragsverfolgung
            </ButtonLink>
          </div>
        ) : null}

        <h2 className="mt-10 border-t border-line pt-8 text-base font-bold text-ink">
          Wie es weitergeht
        </h2>
        <ol className="mt-4 space-y-4">
          {[
            "Wir prüfen Ihre Unterlagen auf Vollständigkeit und melden uns bei Rückfragen.",
            "Der Vorgang wird bei der zuständigen Zulassungsbehörde eingereicht.",
            "Kennzeichen und Papiere gehen versichert an Ihre Lieferadresse.",
          ].map((text, i) => (
            <li key={text} className="flex gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-[var(--color-on-accent)]">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-ink-2">{text}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="secondary">
            Zur Startseite
          </ButtonLink>
          <ButtonLink href="/kontakt" variant="secondary">
            Frage zum Auftrag
          </ButtonLink>
        </div>

        <p className="mt-8 text-sm text-ink-2">
          Rückfragen? {site.contact.phone} · {site.contact.email} ·{" "}
          {site.contact.hours}
        </p>
      </Container>
    </>
  );
}
