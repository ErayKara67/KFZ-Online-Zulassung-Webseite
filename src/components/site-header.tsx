"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { brand } from "@/lib/brand";
import { Container } from "./ui";

const nav = [
  { href: "/sofortzulassung", label: "Sofortzulassung", badge: "Neu" },
  { href: "/wunschkennzeichen", label: "Wunschkennzeichen" },
  { href: "/kfz-zulassung", label: "Zulassung" },
  { href: "/kfz-ummeldung", label: "Ummeldung" },
  { href: "/kfz-abmeldung", label: "Abmeldung" },
  { href: "/umweltplakette", label: "Umweltplakette" },
];

export function Monogram({ size = "md" }: { size?: "sm" | "md" }) {
  const klasse = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`grid ${klasse} shrink-0 place-items-center rounded-[10px] bg-accent font-bold tracking-tight text-[var(--color-on-accent)]`}
    >
      {brand.monogram}
    </span>
  );
}

export function SiteHeader() {
  const [offen, setOffen] = useState(false);
  const pfad = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ground/85 backdrop-blur-md">
      {/* Servicezeile */}
      <div className="hidden border-b border-line/60 bg-sunk py-2 text-xs text-ink-3 md:block">
        <Container className="flex items-center justify-between gap-6">
          <p>
            Zulassungsservice für Fahrzeuge aus dem Hause {brand.name}
          </p>
          <p className="flex items-center gap-5">
            <a className="font-medium text-ink-2 hover:text-ink" href={`tel:${site.contact.phoneHref}`}>
              {site.contact.phone}
            </a>
            <span>{site.contact.hours}</span>
          </p>
        </Container>
      </div>

      <Container className="flex h-19 items-center justify-between gap-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${brand.name} Startseite`}>
          <Monogram />
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-[0.95rem] font-bold tracking-tight text-ink">
              {brand.name}
            </span>
            <span className="block text-[0.75rem] sm:text-[0.7rem] uppercase tracking-[0.16em] text-accent-bright">
              {brand.tagline}
            </span>
          </span>
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((eintrag) => {
              const aktiv = pfad === eintrag.href;
              return (
                <li key={eintrag.href}>
                  <Link
                    href={eintrag.href}
                    aria-current={aktiv ? "page" : undefined}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      aktiv
                        ? "bg-raised text-ink"
                        : "text-ink-2 hover:bg-raised hover:text-ink"
                    }`}
                  >
                    {eintrag.label}
                    {eintrag.badge ? (
                      <span className="rounded-full bg-accent-veil px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent-bright">
                        {eintrag.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#pruefer"
            className="hidden h-10 items-center rounded-[var(--radius-sm)] bg-accent px-4 text-sm font-semibold text-[var(--color-on-accent)] transition-colors hover:bg-accent-bright sm:inline-flex"
          >
            Kennzeichen prüfen
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border border-line text-ink-2 hover:text-ink xl:hidden"
            aria-expanded={offen}
            aria-controls="mobilmenue"
            onClick={() => setOffen((v) => !v)}
          >
            <span className="sr-only">Menü {offen ? "schließen" : "öffnen"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {offen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </Container>

      {offen ? (
        <div id="mobilmenue" className="border-t border-line bg-card xl:hidden">
          <Container className="py-3">
            <ul className="grid gap-0.5">
              {[...nav, { href: "/zulassungsstellen", label: "Zulassungsstellen", badge: undefined }, { href: "/kontakt", label: "Kontakt", badge: undefined }].map((eintrag) => (
                <li key={eintrag.href}>
                  <Link
                    href={eintrag.href}
                    onClick={() => setOffen(false)}
                    className="flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium text-ink-2 hover:bg-raised hover:text-ink"
                  >
                    {eintrag.label}
                    <span aria-hidden="true" className="text-ink-4">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
