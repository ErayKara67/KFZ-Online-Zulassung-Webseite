import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: true, follow: true },
  alternates: { canonical: "/impressum" },
};

export default function Page() {
  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {site.company.legalName}
        <br />
        {site.company.street}
        <br />
        {site.company.zip} {site.company.city}
        <br />
        {site.company.country}
      </p>

      <h2>Vertreten durch</h2>
      <p>Geschäftsführung: {site.company.ceo}</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: {site.contact.phone}
        <br />
        E-Mail: {site.contact.email}
      </p>

      <h2>Registereintrag</h2>
      <p>
        Eintragung im Handelsregister: {site.company.register}
        <br />
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: {site.company.vatId}
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        {site.company.ceo}, {site.company.street}, {site.company.zip} {site.company.city}
      </p>

      <h2>Hinweis zur Tätigkeit</h2>
      <p>
        {site.company.legalName} ist ein privatwirtschaftlicher Dienstleister und
        keine Behörde. Die Abwicklung erfolgt aufgrund einer von der Kundin bzw.
        dem Kunden erteilten Vollmacht gegenüber der jeweils zuständigen
        Zulassungsbehörde. Amtliche Gebühren werden im Namen und für Rechnung der
        Auftraggeber verauslagt.
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind [nicht] bereit oder verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Haftung für Inhalte und Links</h2>
      <p>
        Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach
        den allgemeinen Gesetzen verantwortlich. Für Inhalte externer Links ist
        stets der jeweilige Anbieter verantwortlich. Zum Zeitpunkt der
        Verlinkung waren keine Rechtsverstöße erkennbar.
      </p>
    </LegalPage>
  );
}
