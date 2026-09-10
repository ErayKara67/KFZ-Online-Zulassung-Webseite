import { checkPlate, validatePlate, type PlateInput, type PlateResult } from "./plate";

/**
 * Vorschlagsgenerator für Wunschkennzeichen.
 *
 * Die meisten Kundinnen und Kunden wissen, was ihnen wichtig ist — Initialen,
 * ein Jahr, ein Datum —, aber nicht, welche Kombination daraus zulässig und
 * frei ist. Der Generator baut aus diesen Angaben Kandidaten und lässt sie
 * durch dieselbe Prüfung laufen wie eine Eingabe von Hand.
 */

export interface IdeenEingabe {
  district: string;
  /** Ein oder zwei Buchstaben, etwa Initialen */
  initialen?: string;
  /** Freie Zahl: Geburtsjahr, Hausnummer, Glückszahl */
  zahl?: string;
  /** Datum im Format TT.MM oder TTMM, etwa ein Hochzeitstag */
  datum?: string;
}

function saeubereBuchstaben(v: string | undefined): string {
  return (v ?? "").toUpperCase().replace(/[^A-ZÄÖÜ]/g, "").slice(0, 2);
}

function saeubereZahl(v: string | undefined): string {
  return (v ?? "").replace(/[^0-9]/g, "").slice(0, 4);
}

/** Baut Kandidaten, ohne sie zu prüfen. Reihenfolge = Vorschlagsreihenfolge. */
export function baueKandidaten(eingabe: IdeenEingabe): PlateInput[] {
  const district = eingabe.district.toUpperCase();
  const initialen = saeubereBuchstaben(eingabe.initialen);
  const zahl = saeubereZahl(eingabe.zahl);
  const datum = saeubereZahl(eingabe.datum);

  const buchstaben = new Set<string>();
  if (initialen) {
    buchstaben.add(initialen);
    if (initialen.length === 2) {
      buchstaben.add(initialen[1] + initialen[0]);
      buchstaben.add(initialen[0]);
    }
  }
  if (buchstaben.size === 0) buchstaben.add("A");

  const zahlen: string[] = [];
  const merke = (z: string) => {
    if (z && !z.startsWith("0") && z.length <= 4 && !zahlen.includes(z)) zahlen.push(z);
  };

  if (zahl) {
    merke(zahl);
    if (zahl.length === 4) merke(zahl.slice(2)); // 1993 -> 93
    if (zahl.length === 4) merke(zahl.slice(0, 2));
  }
  if (datum.length === 4) {
    merke(datum); // 1206
    merke(String(Number(datum.slice(0, 2)))); // Tag
  }
  /* Kurze, beliebte Zahlen als Auffüllung */
  for (const z of ["1", "7", "11", "23", "100"]) merke(z);

  const kandidaten: PlateInput[] = [];
  for (const zz of zahlen) {
    for (const bb of buchstaben) {
      const kandidat = { district, letters: bb, numbers: zz };
      if (validatePlate(kandidat).issues.length === 0) kandidaten.push(kandidat);
    }
  }

  /* Doppelte entfernen, Reihenfolge behalten */
  const gesehen = new Set<string>();
  return kandidaten.filter((k) => {
    const schluessel = `${k.letters}|${k.numbers}`;
    if (gesehen.has(schluessel)) return false;
    gesehen.add(schluessel);
    return true;
  });
}

/** Baut Kandidaten und prüft sie. */
export async function ideenPruefen(
  eingabe: IdeenEingabe,
  anzahl = 6,
): Promise<PlateResult[]> {
  const kandidaten = baueKandidaten(eingabe).slice(0, anzahl);
  return Promise.all(kandidaten.map((k) => checkPlate(k)));
}
