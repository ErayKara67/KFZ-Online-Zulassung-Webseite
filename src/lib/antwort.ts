/**
 * Antwort einer API-Route auslesen, ohne am Parser zu scheitern.
 *
 * Wenn der Server abbricht – abgelaufene Funktion, fehlende Datenbank,
 * Zeitüberschreitung des Hosters – kommt eine leere oder eine HTML-Antwort an.
 * `res.json()` wirft dann „unexpected end of data", und genau dieser Satz stand
 * bisher vor der Nutzerin. Das ist keine Fehlermeldung, mit der jemand etwas
 * anfangen kann. Deshalb wird hier vorsichtig gelesen und im Zweifel ein
 * verständlicher Satz zurückgegeben.
 */
export async function leseJson<T>(
  res: Response,
): Promise<{ ok: boolean; daten: T | null; fehler?: string }> {
  const roh = await res.text().catch(() => "");

  if (roh.trim()) {
    try {
      const daten = JSON.parse(roh) as T & { error?: string };
      return {
        ok: res.ok,
        daten,
        fehler: res.ok ? undefined : (daten?.error ?? standardtext(res.status)),
      };
    } catch {
      /* Keine JSON-Antwort – meist eine Fehlerseite des Hosters. */
    }
  }

  return { ok: false, daten: null, fehler: standardtext(res.status) };
}

function standardtext(status: number): string {
  if (status === 401 || status === 403) {
    return "Die Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.";
  }
  if (status === 404) {
    return "Diese Funktion ist auf dem Server nicht erreichbar.";
  }
  if (status === 413) {
    return "Die übermittelten Daten sind zu groß.";
  }
  if (status === 503) {
    return "Der Dienst ist gerade nicht erreichbar. Bitte in einigen Minuten erneut versuchen.";
  }
  if (status >= 500) {
    return "Auf dem Server ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut — bleibt es dabei, melden Sie sich bitte bei uns.";
  }
  return "Die Anfrage konnte nicht verarbeitet werden.";
}
