import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlateChecker } from "./plate-checker";
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

      <div className="border-b border-line bg-white">
        <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:py-20">
          <div className="max-w-2xl">
            <nav aria-label="Brotkrumen" className="mb-6 text-xs text-ink-500">
              <Link href="/" className="hover:text-brand-700">
                Start
              </Link>
              <span aria-hidden="true" className="mx-2">
                ›
              </span>
              <span className="text-ink-700">{service.title}</span>
            </nav>

            <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <ServiceIcon name={service.icon} className="h-6 w-6" />
            </span>

            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              {service.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">{service.intro}</p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <p>
                <span className="block text-3xl font-semibold text-ink-900">
                  {formatPrice(service.price)}
                </span>
                <span className="text-xs text-ink-500">{service.priceNote}</span>
              </p>
              <ButtonLink href={`/bestellung?leistung=${service.slug}`} size="lg">
                Jetzt beauftragen
              </ButtonLink>
            </div>

            <p className="mt-6 text-sm text-ink-500">{service.duration}</p>
          </div>

          <div>
            {showChecker ? (
              <PlateChecker compact service={service.slug} />
            ) : (
              <Card className="bg-surface">
                <h2 className="text-base font-semibold text-ink-900">Im Preis enthalten</h2>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
                  {service.includes.map((inc) => (
                    <li key={inc} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-brand-600" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href={`/bestellung?leistung=${service.slug}`}
                  className="mt-6 w-full"
                >
                  Auftrag starten
                </ButtonLink>
              </Card>
            )}
          </div>
        </Container>
      </div>

      <TrustBar />

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Leistungsumfang</Eyebrow>
            <H2>Das ist enthalten</H2>
            <ul className="mt-6 space-y-3">
              {service.includes.map((inc) => (
                <li key={inc} className="flex gap-3 text-sm text-ink-700">
                  <Check className="mt-0.5 h-5 w-5 text-brand-600" />
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
                  className="flex gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-700"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-brand-800">
                    {i + 1}
                  </span>
                  {n}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <Eyebrow>Preise im Detail</Eyebrow>
        <H2>Festpreis und optionale Zusätze</H2>

        <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Preisübersicht für {service.title}</caption>
            <thead>
              <tr className="bg-surface text-left">
                <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Position</th>
                <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Beschreibung</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold text-ink-700">Preis</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <td className="px-5 py-3 font-semibold text-ink-900">{service.title}</td>
                <td className="px-5 py-3 text-ink-500">{service.priceNote}</td>
                <td className="px-5 py-3 text-right font-semibold text-ink-900">
                  {formatPrice(service.price)}
                </td>
              </tr>
              {(showChecker ? plateSizes.filter((p) => p.price > 0) : []).map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink-900">{p.label}</td>
                  <td className="px-5 py-3 text-ink-500">{p.description}</td>
                  <td className="px-5 py-3 text-right text-ink-900">+ {formatPrice(p.price)}</td>
                </tr>
              ))}
              {extras.map((e) => (
                <tr key={e.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink-900">{e.label}</td>
                  <td className="px-5 py-3 text-ink-500">{e.description}</td>
                  <td className="px-5 py-3 text-right text-ink-900">+ {formatPrice(e.price)}</td>
                </tr>
              ))}
              {shippingOptions.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-5 py-3 text-ink-900">{s.label}</td>
                  <td className="px-5 py-3 text-ink-500">{s.description}</td>
                  <td className="px-5 py-3 text-right text-ink-900">
                    {s.price === 0 ? "inklusive" : `+ ${formatPrice(s.price)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-ink-500">
          Alle Preise inkl. gesetzlicher Umsatzsteuer. Amtliche Gebühren sind im
          Festpreis enthalten und werden im Namen und für Rechnung der Kundin bzw.
          des Kunden verauslagt.
        </p>
      </Section>

      <Section tone="white">
        <Eyebrow>Weitere Leistungen</Eyebrow>
        <H2>Das könnte ebenfalls passen</H2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {others.map((s) => (
            <Card key={s.slug} className="flex flex-col">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <ServiceIcon name={s.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{s.short}</p>
              <p className="mt-4 text-lg font-semibold text-ink-900">{formatPrice(s.price)}</p>
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
