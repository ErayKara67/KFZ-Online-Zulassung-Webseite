import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Container, Eyebrow, Lead } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt und Support",
  description:
    "Fragen zu Wunschkennzeichen, Zulassung oder einem laufenden Auftrag? Wir sind telefonisch und per E-Mail für Sie erreichbar.",
  alternates: { canonical: "/kontakt" },
};

export default function Page() {
  return (
    <>
      <div className="border-b border-line bg-card">
        <Container className="py-14 lg:py-20">
          <Eyebrow>Support</Eyebrow>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            Kontakt
          </h1>
          <Lead>
            Persönliche Beratung statt Warteschleife. Schreiben Sie uns oder
            rufen Sie an – wir kennen die Anforderungen jeder Zulassungsbehörde.
          </Lead>
        </Container>
      </div>

      <Container className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ContactForm />

        <aside className="space-y-6">
          <div className="rounded-[var(--radius-card)] border border-line bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-2">
              Direkt erreichbar
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-ink-2">Telefon</dt>
                <dd>
                  <a className="font-semibold text-accent-bright hover:underline" href={`tel:${site.contact.phoneHref}`}>
                    {site.contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink-2">E-Mail</dt>
                <dd>
                  <a className="font-semibold text-accent-bright hover:underline" href={`mailto:${site.contact.email}`}>
                    {site.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-ink-2">Servicezeiten</dt>
                <dd className="text-ink-2">{site.contact.hours}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-2">
              Anschrift
            </h2>
            <address className="mt-4 text-sm not-italic leading-relaxed text-ink-2">
              {site.company.legalName}
              <br />
              {site.company.street}
              <br />
              {site.company.zip} {site.company.city}
              <br />
              {site.company.country}
            </address>
          </div>

          <p className="rounded-[var(--radius-card)] bg-accent-veil p-6 text-sm leading-relaxed text-accent-bright">
            Bitte senden Sie uns keine Originaldokumente per Post, solange wir
            sie nicht ausdrücklich angefordert haben. Für die meisten Vorgänge
            genügen gut lesbare Scans oder Fotos.
          </p>
        </aside>
      </Container>
    </>
  );
}
