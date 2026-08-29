import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Auftrag eingegangen",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ auftrag?: string; demo?: string }>;
}) {
  const { auftrag, demo } = await searchParams;

  return (
    <Container className="max-w-2xl py-20">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-ok-100 text-ok-700">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      </span>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Vielen Dank – Ihr Auftrag ist eingegangen
      </h1>

      {auftrag ? (
        <p className="mt-4 text-lg text-ink-700">
          Ihre Auftragsnummer lautet{" "}
          <span className="font-semibold text-ink-900">{auftrag}</span>. Eine
          Bestätigung ist auf dem Weg in Ihr Postfach.
        </p>
      ) : (
        <p className="mt-4 text-lg text-ink-700">
          Eine Bestätigung mit Ihrer Auftragsnummer ist auf dem Weg in Ihr Postfach.
        </p>
      )}

      {demo ? (
        <p className="mt-6 rounded-lg border border-warn-700/25 bg-warn-100 p-4 text-sm text-warn-700">
          <strong>Demo-Modus:</strong> Es wurde keine echte Zahlung ausgelöst,
          weil noch kein Zahlungsdienstleister hinterlegt ist. Der Auftrag wurde
          aber vollständig gespeichert und die Benachrichtigungen wurden erzeugt.
        </p>
      ) : null}

      <ol className="mt-10 space-y-4 border-t border-line pt-8">
        {[
          "Wir prüfen Ihre Unterlagen auf Vollständigkeit und melden uns bei Rückfragen.",
          "Der Vorgang wird bei der zuständigen Zulassungsbehörde eingereicht.",
          "Kennzeichen und Papiere gehen versichert an Ihre Lieferadresse.",
        ].map((text, i) => (
          <li key={text} className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-800 text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-ink-700">{text}</span>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/">Zur Startseite</ButtonLink>
        <ButtonLink href="/kontakt" variant="secondary">
          Frage zum Auftrag
        </ButtonLink>
      </div>

      <p className="mt-8 text-sm text-ink-500">
        Rückfragen? {site.contact.phone} · {site.contact.email} · {site.contact.hours}
      </p>
    </Container>
  );
}
