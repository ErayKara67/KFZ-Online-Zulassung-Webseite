import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Widerrufsrecht",
  alternates: { canonical: "/widerruf" },
};

export default function Page() {
  return (
    <LegalPage title="Widerrufsbelehrung" updated="[Datum eintragen]">
      <h2>Widerrufsrecht</h2>
      <p>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen
        Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem
        Tag des Vertragsschlusses; bei der Lieferung von Waren ab dem Tag, an dem
        Sie oder ein von Ihnen benannter Dritter die Waren in Besitz genommen
        haben.
      </p>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
      </p>
      <p>
        {site.company.legalName}
        <br />
        {site.company.street}
        <br />
        {site.company.zip} {site.company.city}
        <br />
        E-Mail: {site.contact.email}
        <br />
        Telefon: {site.contact.phone}
      </p>
      <p>
        mittels einer eindeutigen Erklärung (z. B. per Post versandter Brief oder
        E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
        Zur Wahrung der Frist reicht es aus, dass Sie die Mitteilung vor Ablauf
        der Widerrufsfrist absenden.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die
        wir von Ihnen erhalten haben, einschließlich der Lieferkosten,
        unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
        zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns
        eingegangen ist.
      </p>

      <h2>Vorzeitiges Erlöschen des Widerrufsrechts</h2>
      <p>
        Das Widerrufsrecht erlischt bei Dienstleistungen vorzeitig, wenn wir die
        Dienstleistung vollständig erbracht haben und mit der Ausführung erst
        begonnen haben, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben
        und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr
        Widerrufsrecht bei vollständiger Vertragserfüllung verlieren.
      </p>
      <p>
        Bei geprägten Kennzeichenschildern besteht kein Widerrufsrecht, da diese
        nach Ihren individuellen Vorgaben angefertigt und eindeutig auf Ihre
        persönlichen Bedürfnisse zugeschnitten sind (§ 312g Abs. 2 Nr. 1 BGB).
      </p>

      <h2>Muster-Widerrufsformular</h2>
      <p>
        Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular
        aus und senden Sie es zurück:
      </p>
      <ul>
        <li>An: {site.company.legalName}, {site.company.street}, {site.company.zip} {site.company.city}, {site.contact.email}</li>
        <li>Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung: ______</li>
        <li>Bestellt am / erhalten am: ______</li>
        <li>Name und Anschrift: ______</li>
        <li>Datum und Unterschrift (nur bei Mitteilung auf Papier): ______</li>
      </ul>
    </LegalPage>
  );
}
