import Link from "next/link";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { Container } from "./ui";

const legal = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerrufsrecht" },
  { href: "/barrierefreiheit", label: "Barrierefreiheit" },
];

const payments = ["PayPal", "Kreditkarte", "Klarna", "Apple Pay", "Google Pay", "SEPA"];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-800 text-sm font-bold text-white">
              KP
            </span>
            <span className="text-base font-semibold text-ink-900">{site.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            Digitaler Zulassungsservice für Wunschkennzeichen, An-, Um- und
            Abmeldungen. Wir übernehmen den Behördengang – Sie bleiben zu Hause.
          </p>
          <dl className="mt-5 space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-ink-500">Telefon:</dt>
              <dd>
                <a className="font-medium text-brand-800 hover:underline" href={`tel:${site.contact.phoneHref}`}>
                  {site.contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-500">E-Mail:</dt>
              <dd>
                <a className="font-medium text-brand-800 hover:underline" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-500">Zeiten:</dt>
              <dd className="text-ink-700">{site.contact.hours}</dd>
            </div>
          </dl>
        </div>

        <nav aria-label="Leistungen">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
            Leistungen
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link className="text-ink-500 hover:text-brand-800" href={`/${s.slug}`}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Service">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
            Service
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link className="text-ink-500 hover:text-brand-800" href="/sofortzulassung">
                Sofortzulassung (i-Kfz)
              </Link>
            </li>
            <li>
              <Link className="text-ink-500 hover:text-brand-800" href="/zulassungsstellen">
                Zulassungsstellen A–Z
              </Link>
            </li>
            <li>
              <Link className="text-ink-500 hover:text-brand-800" href="/ratgeber">
                Ratgeber &amp; Checklisten
              </Link>
            </li>
            <li>
              <Link className="text-ink-500 hover:text-brand-800" href="/kontakt">
                Kontakt &amp; Support
              </Link>
            </li>
            <li>
              <Link className="text-ink-500 hover:text-brand-800" href="/#faq">
                Häufige Fragen
              </Link>
            </li>
            {legal.map((l) => (
              <li key={l.href}>
                <Link className="text-ink-500 hover:text-brand-800" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
              Zahlungsarten
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {payments.map((p) => (
                <li
                  key={p}
                  className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
              Versand
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {site.shipping.carrier} · {site.shipping.cutoff}
              <br />
              {site.shipping.note}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
              Sicherheit
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-500">
              <li>TLS-verschlüsselte Übertragung</li>
              <li>Serverstandort Deutschland</li>
              <li>Datenverarbeitung nach DSGVO</li>
              {site.trust.certification.enabled ? (
                <li>
                  {site.trust.certification.label} · {site.trust.certification.registration}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-3 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.company.legalName}. Alle Rechte vorbehalten.
          </p>
          <p>
            {site.name} ist ein privater Dienstleister und keine Behörde. Amtliche
            Gebühren werden im Namen und für Rechnung der Auftraggeber verauslagt.
          </p>
        </Container>
      </div>
    </footer>
  );
}
