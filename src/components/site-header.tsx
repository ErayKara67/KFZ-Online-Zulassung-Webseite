"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { Container } from "./ui";

const nav = [
  { href: "/wunschkennzeichen", label: "Wunschkennzeichen" },
  { href: "/kfz-zulassung", label: "Zulassung" },
  { href: "/kfz-ummeldung", label: "Ummeldung" },
  { href: "/kfz-abmeldung", label: "Abmeldung" },
  { href: "/umweltplakette", label: "Umweltplakette" },
  { href: "/zulassungsstellen", label: "Zulassungsstellen" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="hidden bg-brand-900 py-2 text-xs text-brand-100 md:block">
        <Container className="flex items-center justify-between">
          <p>Amtliche Gebühren inklusive · Bearbeitung durch geschulte Sachbearbeiter</p>
          <p className="flex items-center gap-5">
            <a className="hover:text-white" href={`tel:${site.contact.phoneHref}`}>
              {site.contact.phone}
            </a>
            <span className="text-brand-200">{site.contact.hours}</span>
          </p>
        </Container>
      </div>

      <Container className="flex h-18 items-center justify-between gap-6 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} Startseite`}>
          <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-800 text-sm font-bold text-white">
            KP
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold tracking-tight text-ink-900">
              {site.name}
            </span>
            <span className="block text-[11px] text-ink-500">
              Zulassungsservice · Kennzeichen
            </span>
          </span>
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-brand-50 text-brand-800"
                        : "text-ink-700 hover:bg-surface hover:text-brand-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#pruefer"
            className="hidden h-10 items-center rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 sm:inline-flex"
          >
            Kennzeichen prüfen
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobilmenue"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menü {open ? "schließen" : "öffnen"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </Container>

      {open ? (
        <div id="mobilmenue" className="border-t border-line bg-white lg:hidden">
          <Container className="py-3">
            <ul className="grid gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/kontakt"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
