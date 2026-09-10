/**
 * Ermittlung der Schadstoffgruppe für die Feinstaubplakette.
 *
 * Rechtsgrundlage ist die 35. BImSchV. Verbindlich zugeordnet wird über die
 * Emissionsschlüsselnummer (Zulassungsbescheinigung Teil I, Feld 14.1; in
 * älteren Fahrzeugscheinen unter „zu 1"). Diese Nummer kennen die wenigsten
 * auswendig — deshalb fragt der Prüfer nach Angaben, die man ablesen kann,
 * und nennt das Ergebnis ausdrücklich als Voreinschätzung. Den Abgleich mit
 * der Schlüsselnummer machen wir vor dem Versand.
 */

export type Antrieb = "benzin" | "diesel" | "elektro" | "gas" | "hybrid";
export type EuroNorm = "vor1" | "1" | "2" | "3" | "4" | "5" | "6";

export interface PlaketteEingabe {
  antrieb: Antrieb;
  euroNorm?: EuroNorm;
  /** Nur bei Diesel relevant: ab Werk oder nachgerüstet */
  partikelfilter?: boolean;
  /** Ottomotoren vor Euro 1: geregelter Katalysator vorhanden? */
  katalysator?: boolean;
}

export interface PlaketteErgebnis {
  gruppe: 1 | 2 | 3 | 4;
  farbe: "keine" | "rot" | "gelb" | "gruen";
  bezeichnung: string;
  /** Kurze Begründung in Alltagssprache */
  begruendung: string;
  /** Darf in Umweltzonen mit grüner Plakette gefahren werden? */
  umweltzoneGruen: boolean;
  /** Hinweis, wie sich das Ergebnis verbessern lässt */
  verbesserung?: string;
}

const FARBEN = {
  1: { farbe: "keine", bezeichnung: "Keine Plakette" },
  2: { farbe: "rot", bezeichnung: "Rote Plakette" },
  3: { farbe: "gelb", bezeichnung: "Gelbe Plakette" },
  4: { farbe: "gruen", bezeichnung: "Grüne Plakette" },
} as const;

function bauErgebnis(
  gruppe: 1 | 2 | 3 | 4,
  begruendung: string,
  verbesserung?: string,
): PlaketteErgebnis {
  const f = FARBEN[gruppe];
  return {
    gruppe,
    farbe: f.farbe,
    bezeichnung: f.bezeichnung,
    begruendung,
    umweltzoneGruen: gruppe === 4,
    verbesserung,
  };
}

export function ermittleSchadstoffgruppe(e: PlaketteEingabe): PlaketteErgebnis {
  /* Elektro und Brennstoffzelle: immer Gruppe 4 */
  if (e.antrieb === "elektro") {
    return bauErgebnis(4, "Elektrofahrzeuge werden der besten Schadstoffgruppe zugeordnet.");
  }

  /* Ottomotoren, Gas und Hybride mit Ottomotor */
  if (e.antrieb === "benzin" || e.antrieb === "gas" || e.antrieb === "hybrid") {
    const katVorhanden = e.katalysator !== false;
    if (katVorhanden) {
      return bauErgebnis(
        4,
        "Fahrzeuge mit Ottomotor und geregeltem Katalysator erhalten die grüne Plakette.",
      );
    }
    return bauErgebnis(
      1,
      "Ohne geregelten Katalysator ist keine Plakette vorgesehen.",
      "Eine Nachrüstung mit geregeltem Katalysator kann die Einstufung verbessern.",
    );
  }

  /* Diesel: nach Euro-Norm und Partikelfilter */
  const norm = e.euroNorm;
  const filter = Boolean(e.partikelfilter);

  if (norm === "6" || norm === "5" || norm === "4") {
    return bauErgebnis(4, `Diesel der Norm Euro ${norm} erhält die grüne Plakette.`);
  }

  if (norm === "3") {
    return filter
      ? bauErgebnis(4, "Euro 3 mit Partikelfilter erreicht die grüne Plakette.")
      : bauErgebnis(
          3,
          "Euro 3 ohne Partikelfilter wird der Gruppe 3 zugeordnet.",
          "Mit einem nachgerüsteten Partikelfilter ist die grüne Plakette möglich.",
        );
  }

  if (norm === "2") {
    return filter
      ? bauErgebnis(
          3,
          "Euro 2 mit Partikelfilter erreicht die gelbe Plakette.",
          "Für die grüne Plakette reicht Euro 2 auch mit Filter in der Regel nicht.",
        )
      : bauErgebnis(
          2,
          "Euro 2 ohne Partikelfilter wird der Gruppe 2 zugeordnet.",
          "Ein nachgerüsteter Partikelfilter kann die gelbe Plakette ermöglichen.",
        );
  }

  if (norm === "1") {
    return filter
      ? bauErgebnis(2, "Euro 1 mit Partikelfilter erreicht die rote Plakette.")
      : bauErgebnis(
          1,
          "Für Euro 1 ohne Partikelfilter ist keine Plakette vorgesehen.",
          "Ein nachgerüsteter Partikelfilter kann die rote Plakette ermöglichen.",
        );
  }

  return bauErgebnis(
    1,
    "Für Dieselfahrzeuge unterhalb Euro 1 ist keine Plakette vorgesehen.",
  );
}

export const euroNormen: { wert: EuroNorm; label: string }[] = [
  { wert: "6", label: "Euro 6" },
  { wert: "5", label: "Euro 5" },
  { wert: "4", label: "Euro 4" },
  { wert: "3", label: "Euro 3" },
  { wert: "2", label: "Euro 2" },
  { wert: "1", label: "Euro 1" },
  { wert: "vor1", label: "Älter als Euro 1" },
];

export const antriebe: { wert: Antrieb; label: string }[] = [
  { wert: "benzin", label: "Benzin" },
  { wert: "diesel", label: "Diesel" },
  { wert: "elektro", label: "Elektro" },
  { wert: "hybrid", label: "Hybrid" },
  { wert: "gas", label: "Erd- oder Autogas" },
];
