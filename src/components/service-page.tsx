import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlateChecker } from "./plate-checker";
import { PlaketteChecker } from "./plakette-checker";
import { ServiceIcon, CtaBand, FaqSection, TrustBar } from "./sections";
import { ButtonLink, Card, Check, Container, Eyebrow, H2, Section } from "./ui";
import { getService, formatPrice, services } from "@/lib/services";
import { extras, plateSizes, shippingOptions } from "@/lib/order";

export function serviceMetadata(slug: string): Metadata {
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/${slug}` },
  };
}

export function ServicePage({ slug }: { slug: string }) {
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== slug).slice(0, 3);
  const showChecker = service.sections.includes("plate");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription,
    areaServed: "DE",
    offers: {
      "@type": "Offer",
      price: (service.price / 100).toFixed(2),
      priceCurrency: "EUR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-line bg-card">
        <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:py-20">
          <div className="max-w-2xl">
            <nav aria-label="Brotkrumen" className="mb-6 text-xs text-ink-2">
              <Link href="/" className="hover:text-accent-bright">
                Start
              </Link>
              <span aria-hidden="true" className="mx-2">
                ›
              </span>
              <span className="text-ink-2">{service.title}</span>
            </nav>

            <span className="grid h-12 w-12 place-items-center rounded-lg bg-accent-veil text-accent-bright">
              <ServiceIcon name={service.icon} className="h-6 w-6" />
            </span>

            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              {service.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-2">{service.intro}</p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <p>
                <span className="block text-3xl font-semibold text-ink">
                  {formatPrice(service.price)}
                </span>
                <span className="text-xs text-ink-2">{service.priceNote}</span>
              </p>
              <ButtonLink href={`/bestellung?leistung=${service.slug}`} size="lg">
                Jetzt beauftragen
              </ButtonLink>
            </div>

            <p className="mt-6 text-sm text-ink-2">{service.duration}</p>
          </div>

          <div>
            {slug === "umweltplakette" ? (
              <PlaketteChecker />
            ) : showChecker ? (
              <PlateChecker compact service={service.slug} />
            ) : (
              <Card className="bg-card">
                <h2 className="text-base font-semibold text-ink">Im Preis enthalten</h2>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-2">
                  {service.includes.map((inc) => (
                    <li key={inc} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-accent-bright" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href={`/bestellung?leistung=${service.slug}`}
                  className="mt-6 w-full"
                >
                  Jetzt beauftragen
                </ButtonLink>
              </Card>
            )}
          </div>
        </Container>
      </div>

      <TrustBar />

      <Section tone="base">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Leistungsumfang</Eyebrow>
            <H2>Das ist enthalten</H2>
            <ul className="mt-6 space-y-3">
              {service.includes.map((inc) => (
                <li key={inc} className="flex gap-3 text-sm text-ink-2">
                  <Check className="mt-0.5 h-5 w-5 text-accent-bright" />
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Eyebrow>Checkliste</Eyebrow>
            <H2>Das brauchen wir von Ihnen</H2>
            <ol className="mt-6 space-y-3">
              {service.needed.map((n, i) => (
                <li
                  key={n}
                  className="flex gap-3 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink-2"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-xs font-bold text-accent-bright">
                    {i + 1}
                  </span>
                  {n}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section tone="raised">
        <Eyebrow>Preise im Detail</Eyebrow>
        <H2>Festpreis und optionale Zusätze</H2>

        <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-card">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Preisübersicht für {service.title}</caption>
            <thead>
              <tr className="bg-card text-left">
                <th scope="col" className="px-5 py-3 font-semibold text-ink-2">Position</th>
                <th scope="col" className="px-5 py-3 font-semibold text-ink-2">Beschreibung</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold text-ink-2">Preis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <td className="px-5 py-3 font-semibold text-ink">{service.title}</td>
                <td className="px-5 py-3 text-ink-2">{service.priceNote}</td>
                <td className="px-5 py-3 text-right font-semibold text-ink">
                  {formatPrice(service.price)}
                </td>
              </tr>
              {(showChecker ? plateSizes.filter((p) => p.price > 0) : []).map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink">{p.label}</td>
                  <td className="px-5 py-3 text-ink-2">{p.description}</td>
                  <td className="px-5 py-3 text-right text-ink">+ {formatPrice(p.price)}</td>
                </tr>
              ))}
              {extras.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink">{e.label}</td>
                  <td className="px-5 py-3 text-ink-2">{e.description}</td>
                  <td className="px-5 py-3 text-right text-ink">+ {formatPrice(e.price)}</td>
                </tr>
              ))}
              {shippingOptions.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink">{s.label}</td>
                  <td className="px-5 py-3 text-ink-2">{s.description}</td>
                  <td className="px-5 py-3 text-right text-ink">
                    {s.price === 0 ? "inklusive" : `+ ${formatPrice(s.price)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-ink-2">
          Alle Preise inkl. gesetzlicher Umsatzsteuer. Amtliche Gebühren sind im
          Festpreis enthalten und werden im Namen und für Rechnung der Kundin bzw.
          des Kunden verauslagt.
        </p>
      </Section>

      <Section tone="base">
        <Eyebrow>Weitere Leistungen</Eyebrow>
        <H2>Das könnte ebenfalls passen</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {others.map((s) => (
            <Card key={s.slug} className="flex flex-col">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-veil text-accent-bright">
                <ServiceIcon name={s.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-2">{s.short}</p>
              <p className="mt-4 text-lg font-semibold text-ink">{formatPrice(s.price)}</p>
              <ButtonLink href={`/${s.slug}`} variant="secondary" className="mt-4">
                Ansehen
              </ButtonLink>
            </Card>
          ))}
        </div>
      </Section>

      <FaqSection />
      <CtaBand />
    </>
  );
}
