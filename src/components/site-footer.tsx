import Link from "next/link";
import { site } from "@/lib/site";
import { brand } from "@/lib/brand";
import { services } from "@/lib/services";
import { Container } from "./ui";
import { Monogram } from "./site-header";

const recht = [
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/agb", label: "AGB" },
  { href: "/widerruf", label: "Widerrufsrecht" },
  { href: "/barrierefreiheit", label: "Barrierefreiheit" },
];

const zahlarten = ["Kreditkarte", "PayPal", "Klarna", "Apple Pay", "Google Pay"];

export function SiteFooter() {
  return (
    /* safe-bottom hält den Fußbereich über dem Bedienbalken neuerer iPhones */
    <footer className="safe-bottom border-t border-line bg-sunk">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Monogram size="sm" />
            <span className="text-[0.95rem] font-bold tracking-tight text-ink">
              {brand.name}
            </span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-3">
            Fahrzeugzulassung für Käuferinnen und Käufer unseres {brand.betriebsart}s
            — online beauftragt, ohne Behördengang, zum Übergabetermin fertig.
          </p>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="sr-only">Telefon</dt>
              <dd>
                <a className="font-semibold text-ink hover:text-accent-bright" href={`tel:${site.contact.phoneHref}`}>
                  {site.contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">E-Mail</dt>
              <dd>
                <a className="text-ink-2 hover:text-accent-bright" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">Servicezeiten</dt>
              <dd className="text-ink-3">{site.contact.hours}</dd>
            </div>
          </dl>
        </div>

        <nav aria-label="Leistungen">
          <h2 className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
            Leistungen
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link className="text-ink-2 hover:text-accent-bright" href={`/${s.slug}`}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Service">
          <h2 className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
            Service
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link className="text-ink-2 hover:text-accent-bright" href="/sofortzulassung">
                Sofortzulassung
              </Link>
            </li>
            <li>
              <Link className="text-ink-2 hover:text-accent-bright" href="/zulassungsstellen">
                Zulassungsstellen A–Z
              </Link>
            </li>
            <li>
              <Link className="text-ink-2 hover:text-accent-bright" href="/ratgeber">
                Ratgeber
              </Link>
            </li>
            <li>
              <Link className="text-ink-2 hover:text-accent-bright" href="/kontakt">
                Kontakt
              </Link>
            </li>
            <li>
              <Link className="text-ink-2 hover:text-accent-bright" href="/fuer-autohaeuser">
                Für Autohäuser
              </Link>
            </li>
            {recht.map((l) => (
              <li key={l.href}>
                <Link className="text-ink-2 hover:text-accent-bright" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-7">
          <div>
            <h2 className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
              Zahlungsarten
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {zahlarten.map((z) => (
                <li
                  key={z}
                  className="rounded-md border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink-2"
                >
                  {z}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
              Versand &amp; Sicherheit
            </h2>
            <ul className="mt-5 space-y-2 text-sm text-ink-3">
              <li>{site.shipping.carrier} · {site.shipping.cutoff}</li>
              <li>TLS-verschlüsselte Übertragung</li>
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
        <Container className="flex flex-col gap-3 py-6 text-xs text-ink-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.company.legalName}. Alle Rechte vorbehalten.
          </p>
          <p className="max-w-xl sm:text-right">
            Der Zulassungsservice ist eine private Dienstleistung und keine
            Behörde. Amtliche Gebühren werden im Namen und für Rechnung der
            Auftraggeber verauslagt.
          </p>
        </Container>
      </div>
    </footer>
  );
}
