import Link from "next/link";
import { services, formatPrice, type Service } from "@/lib/services";
import { featuredDistricts } from "@/lib/districts";
import { site } from "@/lib/site";
import { brand } from "@/lib/brand";
import {
  Badge,
  ButtonLink,
  Card,
  Check,
  Container,
  Eyebrow,
  H2,
  Lead,
  Section,
} from "./ui";

/* ---------------------------------------------------------------- Symbole */

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

/* ------------------------------------------------------- Leistungsversprechen */

export function TrustBar() {
  const punkte = [
    { titel: "Amtliche Gebühren inklusive", text: "Bei der Behörde zahlen Sie nichts nach." },
    { titel: "Kein Termin, kein Amt", text: "Vollmacht digital erteilen, wir gehen hin." },
    { titel: "Zum Übergabetermin fertig", text: "Abgestimmt mit Ihrem Abholtermin." },
    { titel: "Ansprechpartner im Haus", text: site.contact.hours },
  ];

  return (
    <div className="border-y border-line bg-sunk">
      <Container>
        <ul className="grid gap-x-10 gap-y-7 py-9 sm:grid-cols-2 lg:grid-cols-4">
          {punkte.map((p) => (
            <li key={p.titel} className="flex gap-3">
              <Check className="mt-0.5 h-5 w-5 text-accent-bright" />
              <span>
                <span className="block text-sm font-semibold text-ink">{p.titel}</span>
                <span className="mt-0.5 block text-sm text-ink-3">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

/* --------------------------------------------------------- Autohaus-Kontext */

export function AutohausSection() {
  const schritte = [
    {
      zeit: "Beim Kauf",
      titel: "Zulassung gleich mitbestellen",
      text: `Sie unterschreiben den Kaufvertrag bei ${brand.name} und beauftragen die Zulassung im selben Zug — online, in wenigen Minuten.`,
    },
    {
      zeit: "Danach",
      titel: "Wir erledigen den Behördengang",
      text: "Kennzeichen reservieren, Unterlagen prüfen, Vorgang einreichen. Sie bekommen zu jedem Schritt eine Nachricht.",
    },
    {
      zeit: "Zur Übergabe",
      titel: "Fahrzeug steht angemeldet bereit",
      text: "Schilder montiert, Papiere dabei. Sie steigen ein und fahren los — kein zweiter Termin, keine Wartenummer.",
    },
  ];

  return (
    <Section tone="base" id="ablauf-autohaus">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Eyebrow>Fahrzeugkauf bei {brand.name}</Eyebrow>
          <H2>Ihr Auto wartet nicht auf das Amt</H2>
          <Lead>
            Zwischen Kaufvertrag und erster Fahrt liegt normalerweise ein
            Behördentermin. Bei uns nicht: Die Zulassung läuft parallel zur
            Fahrzeugaufbereitung und ist fertig, wenn Sie zur Übergabe kommen.
          </Lead>
          <ButtonLink href="/#pruefer" className="mt-8" size="lg">
            Kennzeichen aussuchen
          </ButtonLink>
        </div>

        <ol className="relative grid gap-0">
          {schritte.map((s, i) => (
            <li key={s.titel} className="relative grid grid-cols-[auto_1fr] gap-5 pb-9 last:pb-0">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent-veil text-sm font-bold text-accent-bright"
                >
                  {i + 1}
                </span>
                {i < schritte.length - 1 ? (
                  <span aria-hidden="true" className="mt-2 w-px flex-1 bg-line" />
                ) : null}
              </div>
              <div className="pt-1.5">
                <p className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-bright">
                  {s.zeit}
                </p>
                <h3 className="mt-2 text-lg font-bold tracking-tight text-ink">{s.titel}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-2">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------- Sofortzulassung */

export function SofortSection() {
  return (
    <Section tone="raised" id="sofortzulassung" className="relative overflow-hidden">
      <div aria-hidden="true" className="hatch pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Badge tone="ok">Sofort fahrbereit</Badge>
          <H2 className="mt-5">
            Zulassen und losfahren, bevor die Papiere kommen
          </H2>
          <Lead>
            Mit dem Verfahren i-Kfz Stufe 4 erhalten Sie nach der Zulassung einen
            vorläufigen Zulassungsnachweis. Sobald die Schilder montiert sind,
            dürfen Sie damit bis zu 14 Tage fahren — Zulassungsbescheinigung und
            Plaketten kommen in dieser Zeit per Post.
          </Lead>

          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {[
              "Kein Warten auf die Papiere",
              "Keine Ausweiskopie, keine Scans",
              "Nachweis sofort als PDF",
              "Fristen immer im Blick",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 text-sm text-ink-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/bestellung?leistung=kfz-zulassung&sofort=1" size="lg">
              Sofortzulassung beauftragen
            </ButtonLink>
            <ButtonLink href="/sofortzulassung" variant="secondary" size="lg">
              Wie es funktioniert
            </ButtonLink>
          </div>
        </div>

        <Card className="bg-ground">
          <h3 className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-3">
            Zeitplan einer Sofortzulassung
          </h3>
          <ol className="mt-6 space-y-5">
            {[
              ["Tag 0", "Auftrag erteilt, Kennzeichen reserviert, Schilder gehen per Express raus"],
              ["Tag 1", "Schilder da, Vollmacht signiert, Antrag eingereicht"],
              ["Tag 1", "Bescheid erteilt — Nachweis ausdrucken, Schilder montieren, losfahren"],
              ["bis Tag 14", "Papiere und Plaketten kommen per Post und werden angebracht"],
            ].map(([tag, text]) => (
              <li key={text} className="grid grid-cols-[5.5rem_1fr] gap-4">
                <span className="text-[0.75rem] sm:text-[0.7rem] font-bold uppercase tracking-wider text-accent-bright tnum">
                  {tag}
                </span>
                <span className="text-sm leading-relaxed text-ink-2">{text}</span>
              </li>
            ))}
          </ol>
          <p className="mt-7 border-t border-line pt-5 text-xs leading-relaxed text-ink-3">
            Voraussetzung sind Fahrzeugpapiere mit Sicherheitscode, gültige
            Hauptuntersuchung, eVB-Nummer, SEPA-Mandat und eine elektronische
            Identifizierung. Wir prüfen das im Auftrag Schritt für Schritt.
          </p>
        </Card>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ Vier Schritte */

const schritte = [
  {
    titel: "Kombination prüfen",
    text: "Ortskürzel, Buchstaben und Zahlen eingeben. Wir prüfen sofort, ob die Kombination zulässig ist, und fragen die Verfügbarkeit bei Ihrer Zulassungsbehörde ab.",
  },
  {
    titel: "Auftrag erteilen",
    text: "Fahrzeug- und Halterdaten eingeben, Unterlagen hochladen und die Vollmacht digital erteilen.",
  },
  {
    titel: "Wir gehen zur Behörde",
    text: "Unsere Sachbearbeitung reserviert das Kennzeichen und bringt den Vorgang bei der Zulassungsstelle durch.",
  },
  {
    titel: "Kennzeichen und Papiere",
    text: "Geprägte Schilder und Dokumente kommen versichert per Post — oder liegen zur Fahrzeugübergabe bereit.",
  },
];

export function StepsSection() {
  return (
    <Section tone="base" id="ablauf">
      <div className="max-w-2xl">
        <Eyebrow>So läuft es ab</Eyebrow>
        <H2>Vier Schritte, kein Wartezimmer</H2>
        <Lead>
          Der komplette Vorgang läuft online. Sie brauchen weder einen Termin bei
          der Zulassungsstelle noch einen freien Vormittag.
        </Lead>
      </div>

      <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {schritte.map((s, i) => (
          <li
            key={s.titel}
            className="group relative rounded-[var(--radius-card)] border border-line bg-card p-6 transition-colors hover:border-line-lit"
          >
            <span className="block text-3xl font-bold tabular-nums text-line-lit transition-colors group-hover:text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-base font-bold tracking-tight text-ink">{s.titel}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* --------------------------------------------------------------- Leistungen */

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex flex-col transition-colors hover:border-accent/50">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-sm)] bg-accent-veil text-accent-bright">
          <ServiceIcon name={service.icon} className="h-6 w-6" />
        </span>
        {service.badge ? <Badge>{service.badge}</Badge> : null}
      </div>

      <h3 className="mt-6 text-lg font-bold tracking-tight text-ink">{service.title}</h3>
      <p className="mt-1 text-sm text-ink-3">{service.short}</p>

      <ul className="mt-5 space-y-2 text-sm text-ink-2">
        {service.includes.slice(0, 3).map((inc) => (
          <li key={inc} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" />
            <span>{inc}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <div className="flex items-end justify-between border-t border-line pt-5">
          <p>
            <span className="block text-2xl font-bold tracking-tight text-ink tnum">
              {formatPrice(service.price)}
            </span>
            <span className="mt-0.5 block text-xs text-ink-3">{service.priceNote}</span>
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ButtonLink href={`/bestellung?leistung=${service.slug}`}>Beauftragen</ButtonLink>
          <ButtonLink href={`/${service.slug}`} variant="secondary">
            Details
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}

export function ServicesSection() {
  return (
    <Section tone="raised" id="leistungen">
      <div className="max-w-2xl">
        <Eyebrow>Leistungen &amp; Preise</Eyebrow>
        <H2>Ein Festpreis, alle Gebühren enthalten</H2>
        <Lead>
          Die angegebenen Preise sind Endpreise inklusive amtlicher Gebühren,
          Bearbeitung und Versand. Bei der Zulassungsstelle fallen keine
          weiteren Kosten an.
        </Lead>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-4">
        Alle Preise in Euro inkl. gesetzlicher Umsatzsteuer. Amtliche Gebühren
        werden im Namen und für Rechnung der Kundin bzw. des Kunden verauslagt.
      </p>
    </Section>
  );
}

/* ----------------------------------------------------------------- Vorteile */

export function BenefitsSection() {
  const punkte = [
    {
      titel: "Zeitersparnis",
      text: "Kein Termin, keine Wartenummer, keine Fahrt zur Behörde. Der Auftrag ist in wenigen Minuten erteilt.",
    },
    {
      titel: "Rechtssichere Abwicklung",
      text: "Geschulte Sachbearbeiter prüfen Ihre Unterlagen vor der Einreichung auf Vollständigkeit.",
    },
    {
      titel: "Geprägte Qualitätsschilder",
      text: "Aluminium-Schilder nach DIN 74069, reflektierend, wetterfest und passgenau für Ihr Fahrzeug.",
    },
  ];

  return (
    <Section tone="base">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>Warum über uns</Eyebrow>
          <H2>Behördengang ohne Behörde</H2>
          <Lead>
            Wir sind kein Amt, sondern Ihr Dienstleister: Wir bereiten den
            Vorgang vollständig vor, treten mit Ihrer Vollmacht bei der
            Zulassungsstelle auf und schicken Ihnen das Ergebnis nach Hause.
          </Lead>
          <ButtonLink href="/#pruefer" className="mt-8" size="lg">
            Kennzeichen prüfen
          </ButtonLink>
        </div>

        <ul className="grid gap-4">
          {punkte.map((b) => (
            <li key={b.titel} className="rounded-[var(--radius-card)] border border-line bg-card p-6">
              <h3 className="text-base font-bold tracking-tight text-ink">{b.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- Erklärung */

export function ExplainerSection() {
  return (
    <Section tone="raised">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <Eyebrow>Grundlagen</Eyebrow>
          <H2>Was ist ein Wunschkennzeichen?</H2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-2">
            <p>
              Ein Wunschkennzeichen ist ein amtliches Kennzeichen, bei dem Sie
              den Buchstaben- und Zahlenteil hinter dem Unterscheidungszeichen
              Ihres Zulassungsbezirks selbst bestimmen. Das Ortskürzel richtet
              sich nach Ihrem Wohnsitz und ist nicht frei wählbar.
            </p>
            <p>
              Zulässig sind ein bis zwei Buchstaben und ein bis vier Ziffern. Das
              gesamte Kennzeichen darf acht Zeichen nicht überschreiten, der
              Zahlenteil nicht mit einer Null beginnen. Kombinationen mit
              verfassungsfeindlichem Bezug werden bundesweit nicht vergeben.
            </p>
            <p>
              Die Reservierung ist je nach Zulassungsbezirk in der Regel 30 bis
              90 Tage gültig. In dieser Zeit ist die Kombination für Sie
              gesperrt.
            </p>
          </div>
        </div>

        <div>
          <Eyebrow>Gute Gründe</Eyebrow>
          <H2>Warum überhaupt ein Wunschkennzeichen?</H2>
          <ul className="mt-6 grid gap-3">
            {[
              ["Persönlich", "Initialen, Geburtsjahr oder Hochzeitstag am eigenen Fahrzeug."],
              ["Wiedererkennbar", "Das eigene Auto auf dem vollen Parkplatz sofort finden."],
              ["Geschäftlich", "Firmenkürzel im Fuhrpark — einheitlich über alle Fahrzeuge."],
              ["Praktisch", "Ein leicht zu merkendes Kennzeichen hilft bei Formularen und Parkausweisen."],
            ].map(([titel, text]) => (
              <li key={titel} className="rounded-[var(--radius-card)] border border-line bg-ground p-5">
                <h3 className="text-sm font-bold text-ink">{titel}</h3>
                <p className="mt-1 text-sm text-ink-3">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------- Zulassungsbezirke */

export function DistrictsSection() {
  return (
    <Section tone="base" id="zulassungsstellen">
      <div className="max-w-2xl">
        <Eyebrow>Zulassungsbezirke</Eyebrow>
        <H2>Bundesweit für Sie im Einsatz</H2>
        <Lead>
          Wir arbeiten bundesweit. Welche Vorgänge digital möglich sind, hängt
          vom jeweiligen Zulassungsbezirk ab — was in Ihrem Bezirk geht, sagen
          wir Ihnen vor der Beauftragung.
        </Lead>
      </div>

      <div className="mt-12 overflow-x-auto rounded-[var(--radius-card)] border border-line">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">
            Auswahl der Zulassungsbezirke mit Unterscheidungszeichen
          </caption>
          <thead>
            <tr className="bg-card text-left">
              <th scope="col" className="px-5 py-3.5 text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">Kürzel</th>
              <th scope="col" className="px-5 py-3.5 text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">Zulassungsbezirk</th>
              <th scope="col" className="px-5 py-3.5 text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">Bundesland</th>
              <th scope="col" className="px-5 py-3.5 text-right text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {featuredDistricts.map((d) => (
              <tr key={d.code} className="border-t border-line transition-colors hover:bg-card">
                <td className="px-5 py-3.5 font-bold text-accent-bright">{d.code}</td>
                <td className="px-5 py-3.5 text-ink">{d.city}</td>
                <td className="px-5 py-3.5 text-ink-3">{d.state}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    className="font-semibold text-ink-2 hover:text-accent-bright"
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

/* --------------------------------------------------------------------- FAQ */

export const faqItems = [
  {
    q: "Wie lange dauert die Lieferung der Kennzeichen?",
    a: "Bestellungen, die werktags vor Annahmeschluss eingehen, versenden wir am selben Tag. Innerhalb Deutschlands sind die Schilder üblicherweise nach ein bis zwei Werktagen bei Ihnen.",
  },
  {
    q: "Kann ich nach der Bestellung wirklich sofort losfahren?",
    a: "Sobald der automatisierte Zulassungsbescheid vorliegt und die Kennzeichenschilder montiert sind – nicht schon mit der Bestellung. Der vorläufige Zulassungsnachweis erlaubt nach § 31 FZV bis zu 14 Tage Fahrt ohne Stempelplaketten; er wird ausgedruckt und von außen gut lesbar im Fahrzeug ausgelegt, der Zulassungsbescheid ist mitzuführen. Deshalb liefern wir die Schilder vor dem Zulassungsantrag per Express.",
  },
  {
    q: "Was brauche ich für die Sofortzulassung?",
    a: "Fahrzeugpapiere mit Sicherheitscode (Teil II ab 2018, Teil I ab 2015), eine gültige Hauptuntersuchung, die eVB-Nummer, ein SEPA-Mandat für die Kfz-Steuer und eine elektronische Identifizierung – per Online-Ausweisfunktion, über einen Identifizierungspartner oder bei Firmen über das ELSTER-Unternehmenskonto.",
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
    <Section tone="raised" id="faq">
      <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <Eyebrow>Häufige Fragen</Eyebrow>
          <H2>Antworten vor der Bestellung</H2>
          <Lead>
            Ihre Frage ist nicht dabei? Rufen Sie an oder schreiben Sie uns — wir
            antworten in der Regel am selben Werktag.
          </Lead>
          <dl className="mt-7 space-y-2.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-ink-3">Telefon:</dt>
              <dd>
                <a className="font-semibold text-ink hover:text-accent-bright" href={`tel:${site.contact.phoneHref}`}>
                  {site.contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-ink-3">E-Mail:</dt>
              <dd>
                <a className="font-semibold text-ink hover:text-accent-bright" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-ground">
          {faqItems.map((item) => (
            <details key={item.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-ink-3 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- Abschluss */

export function CtaBand() {
  return (
    <Section tone="accent">
      <div className="flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-[2.4rem]">
            Kennzeichen sichern, Zulassung erledigen lassen
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed opacity-80">
            Prüfung kostenlos, Reservierung erst nach Ihrer Bestätigung. Alle
            amtlichen Gebühren sind im Festpreis enthalten.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/#pruefer" variant="quiet" size="lg">
            Kennzeichen prüfen
          </ButtonLink>
          <ButtonLink href="/kontakt" variant="outline" size="lg">
            Beratung anfragen
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
