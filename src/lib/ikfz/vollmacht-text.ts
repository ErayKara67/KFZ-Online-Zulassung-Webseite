/**
 * Vollmachtstext für die Zulassung auf Dritte – ohne Server-Abhängigkeiten,
 * damit die Oberfläche exakt denselben Wortlaut anzeigt, der später gehasht
 * und an den Zulassungspartner übermittelt wird.
 *
 * Bei jeder inhaltlichen Änderung die Version hochzählen. So bleibt
 * nachweisbar, welcher Fassung eine Kundin bzw. ein Kunde zugestimmt hat.
 */
export const VOLLMACHT_VERSION = "2026-01";

export const VOLLMACHT_TEXT = `Hiermit bevollmächtige ich den Anbieter, mich gegenüber der zuständigen Zulassungsbehörde und dem Kraftfahrt-Bundesamt in allen Angelegenheiten dieses Zulassungsvorgangs zu vertreten. Die Vollmacht umfasst das Abgeben und Entgegennehmen von Erklärungen, die Nutzung der Großkundenschnittstelle im Rahmen der internetbasierten Fahrzeugzulassung, die Übermittlung der erforderlichen Fahrzeug- und Halterdaten sowie das Verauslagen amtlicher Gebühren in meinem Namen und für meine Rechnung. Die Vollmacht gilt für diesen Vorgang und endet mit seinem Abschluss.`;
