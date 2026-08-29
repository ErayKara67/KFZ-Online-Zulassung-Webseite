import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  alternates: { canonical: "/datenschutz" },
};

export default function Page() {
  return (
    <LegalPage title="Datenschutzerklärung" updated="[Datum eintragen]">
      <h2>1. Verantwortliche Stelle</h2>
      <p>
        {site.company.legalName}, {site.company.street}, {site.company.zip}{" "}
        {site.company.city}, E-Mail: {site.contact.email}, Telefon:{" "}
        {site.contact.phone}. Einen Datenschutzbeauftragten haben wir [benannt /
        nicht benannt]: [Kontaktdaten].
      </p>

      <h2>2. Welche Daten wir verarbeiten</h2>
      <ul>
        <li>
          <strong>Bestanddaten:</strong> Name, Anschrift, Geburtsdatum und
          Geburtsort der Halterin bzw. des Halters.
        </li>
        <li>
          <strong>Fahrzeugdaten:</strong> Fahrzeug-Identifizierungsnummer,
          Nummer der Zulassungsbescheinigung, Kennzeichen, Angaben zur
          Hauptuntersuchung.
        </li>
        <li>
          <strong>Zahlungs- und Steuerdaten:</strong> IBAN für das
          SEPA-Mandat zur Kfz-Steuer sowie die Zahlungsdaten des von Ihnen
          gewählten Zahlungsdienstleisters.
        </li>
        <li>
          <strong>Dokumente:</strong> hochgeladene Ausweis- und Fahrzeugpapiere.
        </li>
        <li>
          <strong>Kontaktdaten:</strong> E-Mail-Adresse, Telefonnummer und der
          Inhalt Ihrer Nachrichten.
        </li>
        <li>
          <strong>Nutzungsdaten:</strong> Server-Logfiles mit IP-Adresse,
          Zeitpunkt des Zugriffs, abgerufener Ressource und Browserkennung.
        </li>
      </ul>

      <h2>3. Zwecke und Rechtsgrundlagen</h2>
      <p>
        Die Verarbeitung Ihrer Auftragsdaten erfolgt zur Erfüllung des mit Ihnen
        geschlossenen Vertrags (Art. 6 Abs. 1 lit. b DSGVO). Die Übermittlung an
        die Zulassungsbehörde ist zur Vertragserfüllung erforderlich. Die
        Verarbeitung von Kontaktanfragen beruht auf Ihrer Einwilligung
        (Art. 6 Abs. 1 lit. a DSGVO) bzw. unserem berechtigten Interesse an der
        Beantwortung (Art. 6 Abs. 1 lit. f DSGVO). Aufbewahrungspflichten
        ergeben sich aus Art. 6 Abs. 1 lit. c DSGVO in Verbindung mit HGB und AO.
      </p>

      <h2>4. Empfänger</h2>
      <ul>
        <li>zuständige Zulassungsbehörde und ggf. Hauptzollamt,</li>
        <li>Zahlungsdienstleister [Name eintragen],</li>
        <li>Versanddienstleister [Name eintragen],</li>
        <li>Hosting- und E-Mail-Dienstleister [Name eintragen],</li>
        <li>Schilderpräger [Name eintragen].</li>
      </ul>
      <p>
        Mit allen Auftragsverarbeitern bestehen Verträge nach Art. 28 DSGVO.
      </p>

      <h2>5. Speicherdauer</h2>
      <p>
        Hochgeladene Ausweis- und Fahrzeugdokumente löschen wir spätestens
        [30] Tage nach Abschluss des Vorgangs. Auftrags- und Rechnungsdaten
        bewahren wir aufgrund handels- und steuerrechtlicher Pflichten
        [6 bzw. 10] Jahre auf. Server-Logfiles werden nach [7] Tagen gelöscht.
      </p>

      <h2>6. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
        Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
        Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21 DSGVO).
        Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft
        widerrufen. Zudem steht Ihnen ein Beschwerderecht bei einer
        Aufsichtsbehörde zu; zuständig ist [Aufsichtsbehörde eintragen].
      </p>

      <h2>7. Cookies und Reichweitenmessung</h2>
      <p>
        Diese Website setzt technisch notwendige Cookies ein, die für den
        Betrieb erforderlich sind. Analyse- oder Marketing-Werkzeuge werden
        [nicht eingesetzt / nur nach Ihrer Einwilligung über das
        Einwilligungsbanner eingesetzt: [Werkzeuge eintragen]].
      </p>

      <h2>8. Hosting</h2>
      <p>
        Die Website wird bei [Hoster eintragen] mit Serverstandort in
        [Deutschland / EU] betrieben. Die Übertragung erfolgt TLS-verschlüsselt.
      </p>
    </LegalPage>
  );
}
