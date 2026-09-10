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
 * Konfiguration über DEALERS als JSON-Liste, zum Beispiel:
 * [{"id":"nordstern","name":"Autohaus Nordstern","monogram":"AN",
 *   "email":"verkauf@example.de","code":"…"}]
 *
 * Ohne Konfiguration steht ein Demozugang bereit, damit sich das Portal
 * vorführen lässt. Der Demozugang ist im Live-Betrieb gesperrt.
 */
export function getDealers(): Dealer[] {
  const roh = process.env.DEALERS;
  if (roh) {
    try {
      const liste = JSON.parse(roh) as Dealer[];
      if (Array.isArray(liste) && liste.length > 0) return liste;
    } catch {
      console.error("[dealers] DEALERS ist kein gültiges JSON – Demozugang aktiv.");
    }
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

export const demoBetrieb = !process.env.DEALERS;

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
