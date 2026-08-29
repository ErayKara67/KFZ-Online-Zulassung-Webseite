import type { PlateInput } from "./plate";

/**
 * Abfrage der tatsächlichen Verfügbarkeit einer Kennzeichenkombination.
 *
 * Diese Auskunft kann nur die Zulassungsbehörde bzw. der angebundene
 * Reservierungsdienstleister geben – es gibt keine öffentliche Datenquelle,
 * aus der sich der Bestand ableiten ließe.
 *
 * Ohne konfigurierte Schnittstelle liefert die Funktion bewusst `null`:
 * Die Anwendung sagt dann „Format zulässig, Verfügbarkeit wird geprüft“
 * statt eine Verfügbarkeit zu behaupten, die sie nicht kennt.
 */

export const verfuegbarkeitLive = Boolean(
  process.env.PLATE_CHECK_URL && process.env.PLATE_CHECK_TOKEN,
);

export type Verfuegbarkeit = "frei" | "vergeben";

export async function pruefeVerfuegbarkeit(
  input: PlateInput,
): Promise<Verfuegbarkeit | null> {
  if (!verfuegbarkeitLive) return null;

  try {
    const res = await fetch(`${process.env.PLATE_CHECK_URL!.replace(/\/+$/, "")}/verfuegbarkeit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PLATE_CHECK_TOKEN}`,
      },
      body: JSON.stringify({
        districtCode: input.district,
        letters: input.letters,
        digits: input.numbers,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) return null;

    const daten = (await res.json()) as { available?: boolean; state?: string };
    if (typeof daten.available === "boolean") {
      return daten.available ? "frei" : "vergeben";
    }
    if (daten.state === "AVAILABLE") return "frei";
    if (daten.state === "TAKEN" || daten.state === "RESERVED") return "vergeben";
    return null;
  } catch {
    // Störung darf nicht als „vergeben“ durchschlagen
    return null;
  }
}
