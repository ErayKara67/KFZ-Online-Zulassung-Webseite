import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Erklärung zur Barrierefreiheit",
  alternates: { canonical: "/barrierefreiheit" },
};

export default function Page() {
  return (
    <LegalPage title="Erklärung zur Barrierefreiheit" updated="[Datum eintragen]">
      <h2>Unser Anspruch</h2>
      <p>
        Wir möchten, dass alle Menschen unsere Leistungen selbstständig nutzen
        können. Die Website wird an den Anforderungen des
        Barrierefreiheitsstärkungsgesetzes (BFSG) und den WCAG 2.1 auf Stufe AA
        ausgerichtet.
      </p>

      <h2>Bereits umgesetzt</h2>
      <ul>
        <li>durchgängige Bedienbarkeit per Tastatur mit sichtbarem Fokus,</li>
        <li>Sprungmarke „Zum Inhalt springen“ am Seitenanfang,</li>
        <li>semantische Überschriftenstruktur und beschriftete Formularfelder,</li>
        <li>Fehlermeldungen im Klartext, zusätzlich zur farblichen Kennzeichnung,</li>
        <li>Kontrastwerte von mindestens 4,5:1 für Fließtext,</li>
        <li>responsive Darstellung bis 320 px Breite und bei 200 % Zoom.</li>
      </ul>

      <h2>Noch nicht vollständig barrierefrei</h2>
      <p>
        [Hier die Ergebnisse Ihrer Prüfung eintragen, z. B. einzelne PDF-Dokumente
        oder eingebundene Inhalte Dritter.]
      </p>

      <h2>Barrieren melden</h2>
      <p>
        Ist Ihnen eine Barriere aufgefallen? Melden Sie sie uns unter{" "}
        {site.contact.email} oder telefonisch unter {site.contact.phone}. Wir
        antworten in der Regel innerhalb von [x] Werktagen und bieten Ihnen für
        die Dauer der Behebung eine alternative Möglichkeit an, den Vorgang zu
        erledigen.
      </p>
    </LegalPage>
  );
}
