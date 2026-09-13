import { timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Händlerzugänge.
 *
 * Ein Autohaus meldet sich mit einem Zugangscode an; daraus wird ein
 * Sitzungscookie. Das reicht für einen Betrieb mit wenigen Personen und ist
 * bewusst schlicht gehalten.
 *
 * GRENZE: Das ist kein Benutzerkonto-System. Alle im Autohaus teilen sich
 * einen Code, es gibt keine persönlichen Anmeldungen, keine Rollen und keine
 * Zwei-Faktor-Anmeldung. Wer mehrere Standorte oder nachvollziehbare
 * Protokolle braucht, bekommt echte Konten — siehe README.
 */

export interface Dealer {
  id: string;
  name: string;
  /** Kürzel für das Logofeld */
  monogram: string;
  email: string;
  /** Zugangscode – gehört in die Umgebungsvariablen, nicht ins Repo */
  code: string;
}

/**
 * Der eingebaute Demozugang mit dem Code „demo" muss ausdrücklich
 * eingeschaltet werden: HAENDLER_DEMO="1".
 *
 * Warum nicht automatisch erkennen, ob die Anwendung öffentlich läuft? Weil
 * jede Erkennung daneben liegen kann — `next start` setzt NODE_ENV etwa auch
 * auf dem eigenen Rechner auf „production". Läge der Demozugang an einer
 * öffentlichen Adresse offen, könnte jeder die Vorgangsliste mit Kundennamen,
 * E-Mail-Adressen und Fahrzeugen einsehen. Eine falsche Vermutung darf diesen
 * Preis nicht haben, also gilt: zu, solange nicht ausdrücklich aufgemacht.
 *
 * Zum Ausprobieren auf dem eigenen Rechner die Zeile in .env.local setzen — auf
 * dem Hoster einfach weglassen.
 */
const demoAusdruecklichErlaubt = process.env.HAENDLER_DEMO === "1";

/**
 * Konfiguration über DEALERS als JSON-Liste, zum Beispiel:
 * [{"id":"nordstern","name":"Autohaus Nordstern","monogram":"AN",
 *   "email":"verkauf@example.de","code":"…"}]
 *
 * Ohne DEALERS und ohne HAENDLER_DEMO gibt es gar keinen Zugang: lieber eine
 * Anmeldung, die niemand benutzen kann, als eine, die jeder benutzen kann.
 */
export function getDealers(): Dealer[] {
  const roh = process.env.DEALERS;
  if (roh) {
    try {
      const liste = JSON.parse(roh) as Dealer[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
      console.error("[dealers] DEALERS ist eine leere Liste – kein Zugang eingerichtet.");
    } catch {
      console.error("[dealers] DEALERS ist kein gültiges JSON – kein Zugang eingerichtet.");
    }
  }

  if (!demoAusdruecklichErlaubt) {
    console.error(
      "[dealers] Kein Händlerzugang eingerichtet — die Anmeldung ist gesperrt. " +
        "Für den Betrieb DEALERS setzen; zum Ausprobieren auf dem eigenen " +
        'Rechner HAENDLER_DEMO="1" (siehe README).',
    );
    return [];
  }

  return [
    {
      id: "demo",
      name: "Autohaus Nordstern",
      monogram: "AN",
      email: "verkauf@example.de",
      code: "demo",
    },
  ];
}

/** true, solange der eingebaute Demozugang gilt – nur nach ausdrücklicher Freigabe */
export const demoBetrieb = !process.env.DEALERS && demoAusdruecklichErlaubt;

/** true, wenn niemand eingetragen und der Demozugang nicht freigegeben ist */
export const zugangFehlt = !process.env.DEALERS && !demoAusdruecklichErlaubt;

export function findeDealer(id: string): Dealer | undefined {
  return getDealers().find((d) => d.id === id);
}

/** Prüft einen Zugangscode und liefert den zugehörigen Händler. */
export function pruefeZugangscode(code: string): Dealer | null {
  const eingabe = Buffer.from(code.trim());
  for (const dealer of getDealers()) {
    const erwartet = Buffer.from(dealer.code);
    if (erwartet.length === eingabe.length && timingSafeEqual(erwartet, eingabe)) {
      return dealer;
    }
  }
  return null;
}

/** Wert für das Sitzungscookie – Händler-ID plus Geheimnisanteil. */
export function sitzungswert(dealer: Dealer): string {
  return `${dealer.id}.${dealer.code}`;
}

export function dealerAusSitzung(wert: string | undefined): Dealer | null {
  if (!wert) return null;
  const trenner = wert.lastIndexOf(".");
  if (trenner < 1) return null;
  const id = wert.slice(0, trenner);
  const code = wert.slice(trenner + 1);
  const dealer = findeDealer(id);
  if (!dealer) return null;
  const a = Buffer.from(dealer.code);
  const b = Buffer.from(code);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return dealer;
}

export const SITZUNGSCOOKIE = "haendler";

/** Erzeugt einen Vorschlag für einen neuen Zugangscode. */
export function neuerZugangscode(): string {
  return randomBytes(12).toString("base64url");
}
