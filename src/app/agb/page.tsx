import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  alternates: { canonical: "/agb" },
};

export default function Page() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen" updated="[Datum eintragen]">
      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Bedingungen gelten für alle Verträge zwischen{" "}
        {site.company.legalName} (nachfolgend „Anbieter“) und der Kundin bzw. dem
        Kunden über Dienstleistungen rund um die Kfz-Zulassung sowie über die
        Lieferung von Kennzeichenschildern.
      </p>

      <h2>§ 2 Gegenstand der Leistung</h2>
      <p>
        Der Anbieter erbringt Dienstleistungen der Auftragsabwicklung gegenüber
        Zulassungsbehörden auf Grundlage einer erteilten Vollmacht. Der Anbieter
        ist keine Behörde. Ein Anspruch auf eine bestimmte Kennzeichenkombination
        besteht nicht; maßgeblich ist die Entscheidung der Behörde.
      </p>

      <h2>§ 3 Vertragsschluss</h2>
      <p>
        Mit Absenden des Auftragsformulars gibt die Kundin bzw. der Kunde ein
        verbindliches Angebot ab. Der Vertrag kommt mit der Auftragsbestätigung
        per E-Mail zustande.
      </p>

      <h2>§ 4 Mitwirkungspflichten</h2>
      <ul>
        <li>vollständige und wahrheitsgemäße Angaben zu Fahrzeug und Halter,</li>
        <li>Übermittlung gut lesbarer, vollständiger Unterlagen,</li>
        <li>Erteilung einer gültigen Vollmacht,</li>
        <li>Bereitstellung einer gültigen eVB-Nummer und eines SEPA-Mandats.</li>
      </ul>
      <p>
        Verzögerungen und Mehraufwand, die auf unvollständige Angaben
        zurückgehen, hat die Kundin bzw. der Kunde zu vertreten.
      </p>

      <h2>§ 5 Preise und Zahlung</h2>
      <p>
        Es gelten die zum Zeitpunkt der Bestellung angegebenen Festpreise
        inklusive der amtlichen Gebühren und der gesetzlichen Umsatzsteuer. Die
        Zahlung erfolgt über den angebundenen Zahlungsdienstleister. Die
        Bearbeitung beginnt nach Zahlungseingang.
      </p>

      <h2>§ 6 Bearbeitungszeit</h2>
      <p>
        Angegebene Bearbeitungszeiten sind unverbindliche Richtwerte. Sie hängen
        von der Auslastung der jeweiligen Zulassungsbehörde ab.
      </p>

      <h2>§ 7 Rücktritt und Stornierung</h2>
      <p>
        Wird ein Vorgang nach Einreichung storniert, sind bereits verauslagte
        amtliche Gebühren sowie bereits geprägte Kennzeichen zu erstatten. Nicht
        angefallene Leistungen werden erstattet.
      </p>

      <h2>§ 8 Gewährleistung und Haftung</h2>
      <p>
        Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des
        Lebens, des Körpers oder der Gesundheit sowie bei Vorsatz und grober
        Fahrlässigkeit. Bei leicht fahrlässiger Verletzung wesentlicher
        Vertragspflichten ist die Haftung auf den vertragstypischen,
        vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung
        ausgeschlossen.
      </p>

      <h2>§ 9 Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
        UN-Kaufrechts. Ist die Kundin bzw. der Kunde Kaufmann, ist Gerichtsstand
        [Ort eintragen]. Sollten einzelne Bestimmungen unwirksam sein, bleibt der
        Vertrag im Übrigen wirksam.
      </p>
    </LegalPage>
  );
}
