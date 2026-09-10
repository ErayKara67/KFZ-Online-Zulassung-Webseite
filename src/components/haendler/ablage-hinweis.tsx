import { ablageDauerhaft } from "@/lib/storage";

/**
 * Warnt sichtbar, wenn Vorgänge nur im Arbeitsspeicher liegen.
 *
 * Das passiert auf Vercel, solange keine Datenbank verbunden ist. Anlegen und
 * Anzeigen funktionieren dann zwar, aber beim nächsten Neustart der Funktion
 * sind die Vorgänge weg. Ein Autohaus darf das nicht erst merken, wenn ein
 * Kundenvorgang fehlt – deshalb steht der Hinweis oben und nicht im Log.
 */
export function AblageHinweis() {
  if (ablageDauerhaft()) return null;

  return (
    <div className="mb-8 rounded-[var(--radius-card)] border border-warn/40 bg-warn/10 p-5">
      <p className="text-sm font-semibold text-ink">
        Vorführbetrieb — Vorgänge werden nicht dauerhaft gespeichert
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-3">
        Es ist keine Datenbank verbunden. Angelegte Vorgänge liegen nur im
        Arbeitsspeicher und gehen verloren, sobald der Server neu startet. Für
        den Echtbetrieb muss eine Ablage hinterlegt werden (README, Abschnitt
        „Ablage“).
      </p>
    </div>
  );
}
