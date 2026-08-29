import Link from "next/link";
import { services, formatPrice, type Service } from "@/lib/services";
import { featuredDistricts } from "@/lib/districts";
import { site } from "@/lib/site";
import { Badge, ButtonLink, Card, Check, Container, Eyebrow, H2, Lead, Section } from "./ui";

/* ---------------------------------------------------------------- Icons */

const iconPaths: Record<string, string> = {
  plate: "M3 8h18v8H3zM7 12h.01M12 12h.01M17 12h.01",
  car: "M4 15h16M6 15v2M18 15v2M5 15l1.6-5A2 2 0 0 1 8.5 8.6h7A2 2 0 0 1 17.4 10L19 15",
  swap: "M4 8h13l-3-3M20 16H7l3 3",
  off: "M12 4v8M6.5 7a8 8 0 1 0 11 0",
  home: "M4 11 12 4l8 7M6 10v10h12V10",
  leaf: "M5 19c0-8 6-13 14-13 0 9-5 14-13 14M5 19c2-3 4-5 7-6.5",
};

export function ServiceIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name] ?? iconPaths.car} />
    </svg>
  );
}

/* ------------------------------------------------------------ Trust bar */

export function TrustBar() {
  const items = [
    { title: "Amtliche Gebühren inklusive", text: "Keine Nachzahlung bei der Behörde." },
    { title: "Kein Behördentermin", text: "Vollmacht digital erteilen, wir gehen hin." },
    { title: "Versand am selben Werktag", text: site.shipping.cutoff },
    { title: "Fester Ansprechpartner", text: site.contact.hours },
  ];
  return (
    <div className="border-y border-line bg-surface">
      <Container>
        <ul className="grid gap-x-8 gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <li key={i.title} className="flex gap-3">
              <Check className="mt-0.5 text-brand-600" />
              <span>
                <span className="block text-sm font-semibold text-ink-900">{i.title}</span>
                <span className="block text-sm text-ink-500">{i.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

/* --------------------------------------------------------------- Steps */

const steps = [
  {
    title: "Verfügbarkeit prüfen",
    text: "Ortskürzel, Buchstaben und Zahlen eingeben. Wir gleichen die Kombination mit dem Bestand Ihres Zulassungsbezirks ab.",
  },
  {
    title: "Auftrag erteilen",
    text: "Fahrzeug- und Halterdaten eingeben, Unterlagen hochladen und die Vollmacht digital unterschreiben.",
  },
  {
    title: "Wir erledigen den Behördengang",
    text: "Unsere Sachbearbeiter reservieren das Kennzeichen und bringen den Vorgang bei der Zulassungsstelle durch.",
  },
  {
    title: "Kennzeichen und Papiere erhalten",
    text: "Geprägte Schilder und Dokumente kommen versichert per Post – fertig plakettiert und montagebereit.",
  },
];

export function StepsSection() {
  return (
    <Section tone="white" id="ablauf">
      <div className="max-w-2xl">
        <Eyebrow>So läuft es ab</Eyebrow>
        <H2>Vier Schritte, kein Wartezimmer</H2>
        <Lead>
          Der komplette Vorgang läuft online. Sie brauchen weder einen Termin bei
          der Zulassungsstelle noch einen freien Vormittag.
        </Lead>
      </div>

      <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative rounded-[var(--radius-card)] border border-line bg-white p-6">
            <span className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-brand-800 text-sm font-bold text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 text-base font-semibold text-ink-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------ Services */

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex flex-col transition-colors hover:border-brand-500">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <ServiceIcon name={service.icon} className="h-6 w-6" />
        </span>
        {service.badge ? <Badge>{service.badge}</Badge> : null}
      </div>

      <h3 className="mt-5 text-lg font-semibold text-ink-900">{service.title}</h3>
      <p className="mt-1 text-sm text-ink-500">{service.short}</p>

      <ul className="mt-5 space-y-2 text-sm text-ink-700">
        {service.includes.slice(0, 3).map((inc) => (
          <li key={inc} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 text-brand-600" />
            <span>{inc}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
        <p>
          <span className="block text-2xl font-semibold text-ink-900">
            {formatPrice(service.price)}
          </span>
          <span className="block text-xs text-ink-500">{service.priceNote}</span>
        </p>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <ButtonLink href={`/bestellung?leistung=${service.slug}`}>Beauftragen</ButtonLink>
        <ButtonLink href={`/${service.slug}`} variant="secondary">
          Details
        </ButtonLink>
      </div>
    </Card>
  );
}

export function ServicesSection() {
  return (
    <Section tone="surface" id="leistungen">
      <div className="max-w-2xl">
        <Eyebrow>Leistungen &amp; Preise</Eyebrow>
        <H2>Ein Festpreis, alle Gebühren enthalten</H2>
        <Lead>
          Die angegebenen Preise sind Endpreise inklusive amtlicher Gebühren,
          Bearbeitung und Versand. Es fallen keine weiteren Kosten bei der
          Zulassungsstelle an.
        </Lead>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-500">
        Alle Preise in Euro inkl. gesetzlicher Umsatzsteuer. Amtliche Gebühren
        werden im Namen und für Rechnung der Kundin bzw. des Kunden verauslagt.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------ Benefits */

export function BenefitsSection() {
  const items = [
    {
      title: "Zeitersparnis",
      text: "Kein Termin, keine Wartenummer, keine Fahrt zur Behörde. Der Auftrag ist in wenigen Minuten erteilt.",
    },
    {
      title: "Rechtssichere Abwicklung",
      text: "Geschulte Sachbearbeiter prüfen Ihre Unterlagen vor der Einreichung auf Vollständigkeit.",
    },
    {
      title: "Geprägte Qualitätsschilder",
      text: "Aluminium-Schilder nach DIN 74069, reflektierend, wetterfest und passgenau für Ihr Fahrzeug.",
    },
  ];

  return (
    <Section tone="white">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <Eyebrow>Warum {site.name}</Eyebrow>
          <H2>Behördengang ohne Behörde</H2>
          <Lead>
            Wir sind kein Amt, sondern Ihr Dienstleister: Wir bereiten den Vorgang
            vollständig vor, treten mit Ihrer Vollmacht bei der Zulassungsstelle
            auf und schicken Ihnen das Ergebnis nach Hause.
          </Lead>
          <ButtonLink href="/#pruefer" className="mt-8" size="lg">
            Kennzeichen prüfen
          </ButtonLink>
        </div>

        <ul className="grid gap-4">
          {items.map((b) => (
            <li key={b.title} className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
              <h3 className="text-base font-semibold text-ink-900">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- Erklärung */

export function ExplainerSection() {
  return (
    <Section tone="surface">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow>Grundlagen</Eyebrow>
          <H2>Was ist ein Wunschkennzeichen?</H2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-700">
            <p>
              Ein Wunschkennzeichen ist ein amtliches Kennzeichen, bei dem Sie den
              Buchstaben- und Zahlenteil hinter dem Unterscheidungszeichen Ihres
              Zulassungsbezirks selbst bestimmen. Das Ortskürzel selbst richtet
              sich nach Ihrem Wohnsitz und ist nicht frei wählbar.
            </p>
            <p>
              Zulässig sind ein bis zwei Buchstaben und ein bis vier Ziffern. Das
              gesamte Kennzeichen darf acht Zeichen nicht überschreiten, der
              Zahlenteil nicht mit einer Null beginnen. Kombinationen mit
              verfassungsfeindlichem Bezug werden bundesweit nicht vergeben.
            </p>
            <p>
              Die Reservierung ist je nach Zulassungsbezirk in der Regel 30 bis 90
              Tage gültig. In dieser Zeit ist die Kombination für Sie gesperrt und
              kann nicht anderweitig vergeben werden.
            </p>
          </div>
        </div>

        <div>
          <Eyebrow>Gute Gründe</Eyebrow>
          <H2>Warum überhaupt ein Wunschkennzeichen?</H2>
          <ul className="mt-5 grid gap-3">
            {[
              ["Persönlich", "Initialen, Geburtsjahr oder Hochzeitstag am eigenen Fahrzeug."],
              ["Wiedererkennbar", "Das eigene Auto auf dem vollen Parkplatz sofort finden."],
              ["Geschäftlich", "Firmenkürzel im Fuhrpark – einheitlich über alle Fahrzeuge."],
              ["Praktisch", "Ein leicht zu merkendes Kennzeichen hilft bei Formularen und Parkausweisen."],
            ].map(([title, text]) => (
              <li key={title} className="rounded-[var(--radius-card)] border border-line bg-white p-5">
                <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
                <p className="mt-1 text-sm text-ink-500">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------- Zulassungsstellen */

export function DistrictsSection() {
  return (
    <Section tone="white" id="zulassungsstellen">
      <div className="max-w-2xl">
        <Eyebrow>Zulassungsbezirke</Eyebrow>
        <H2>Bundesweit für Sie im Einsatz</H2>
        <Lead>
          Wir wickeln Vorgänge in allen deutschen Zulassungsbezirken ab. Hier eine
          Auswahl der am häufigsten angefragten Standorte.
        </Lead>
      </div>

      <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] border border-line">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">
            Auswahl der Zulassungsbezirke mit Unterscheidungszeichen
          </caption>
          <thead>
            <tr className="bg-surface text-left">
              <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Kürzel</th>
              <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Zulassungsbezirk</th>
              <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Bundesland</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold text-ink-700">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {featuredDistricts.map((d) => (
              <tr key={d.code} className="border-t border-line">
                <td className="px-5 py-3 font-bold text-ink-900">{d.code}</td>
                <td className="px-5 py-3 text-ink-700">{d.city}</td>
                <td className="px-5 py-3 text-ink-500">{d.state}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    className="font-semibold text-brand-700 hover:underline"
                    href={`/bestellung?leistung=wunschkennzeichen&bezirk=${d.code}`}
                  >
                    Kennzeichen sichern
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ButtonLink href="/zulassungsstellen" variant="secondary" className="mt-6">
        Alle Zulassungsstellen anzeigen
      </ButtonLink>
    </Section>
  );
}

/* ----------------------------------------------------------------- FAQ */

export const faqItems = [
  {
    q: "Wie lange dauert die Lieferung der Kennzeichen?",
    a: "Bestellungen, die werktags vor Annahmeschluss eingehen, versenden wir am selben Tag. Innerhalb Deutschlands sind die Schilder üblicherweise nach ein bis zwei Werktagen bei Ihnen.",
  },
  {
    q: "Sind kurze Kombinationen wie „B-A 1“ möglich?",
    a: "Ja. Zulässig sind ein bis zwei Buchstaben und ein bis vier Ziffern. Besonders kurze Kombinationen sind allerdings fast überall vergeben – unsere Prüfung zeigt Ihnen sofort freie Alternativen.",
  },
  {
    q: "Wie lange gilt eine Reservierung?",
    a: "Das legt der jeweilige Zulassungsbezirk fest, üblich sind 30 bis 90 Tage. Die konkrete Frist für Ihren Bezirk nennen wir Ihnen in der Auftragsbestätigung.",
  },
  {
    q: "Kann ich mein Fahrzeug wirklich vollständig online zulassen?",
    a: "Ja. Sie erteilen uns eine Vollmacht, laden die erforderlichen Unterlagen hoch und wir übernehmen den Behördengang. Zulassungsbescheinigung und Kennzeichen erhalten Sie anschließend per Post.",
  },
  {
    q: "Welche Unterlagen brauche ich für eine Zulassung?",
    a: "Zulassungsbescheinigung Teil II, eine gültige eVB-Nummer Ihrer Versicherung, ein SEPA-Mandat für die Kfz-Steuer, Ihr Ausweisdokument sowie die unterschriebene Vollmacht. Bei Gebrauchtfahrzeugen zusätzlich Teil I und der HU-Nachweis.",
  },
  {
    q: "Was passiert, wenn die Zulassung nicht klappt?",
    a: "Fehlen Unterlagen, melden wir uns vor der Einreichung bei Ihnen. Lässt sich der Vorgang nicht abschließen, erstatten wir die bereits gezahlten amtlichen Gebühren; berechnet wird dann nur der tatsächlich angefallene Aufwand.",
  },
];

export function FaqSection() {
  return (
    <Section tone="surface" id="faq">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <Eyebrow>Häufige Fragen</Eyebrow>
          <H2>Antworten vor der Bestellung</H2>
          <Lead>
            Ihre Frage ist nicht dabei? Rufen Sie uns an oder schreiben Sie uns –
            wir antworten in der Regel am selben Werktag.
          </Lead>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-ink-500">Telefon:</dt>
              <dd>
                <a className="font-semibold text-brand-800 hover:underline" href={`tel:${site.contact.phoneHref}`}>
                  {site.contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-500">E-Mail:</dt>
              <dd>
                <a className="font-semibold text-brand-800 hover:underline" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
          {faqItems.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink-900">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-ink-500 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------- CTA band */

export function CtaBand() {
  return (
    <Section tone="brand">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Kennzeichen sichern, Zulassung erledigen lassen
          </h2>
          <p className="mt-3 text-brand-100">
            Prüfung kostenlos, Reservierung erst nach Ihrer Bestätigung. Alle
            amtlichen Gebühren sind im Festpreis enthalten.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/#pruefer" variant="onDark" size="lg">
            Verfügbarkeit prüfen
          </ButtonLink>
          <ButtonLink
            href="/kontakt"
            size="lg"
            className="border border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            Beratung anfragen
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
