/**
 * Gesperrte Kennzeichenkombinationen.
 *
 * Rechtsgrundlage ist § 8 FZV: Kombinationen, die gegen die guten Sitten
 * verstoßen, sind unzulässig. Bundesweit einheitlich gesperrt sind nur fünf
 * Buchstabenkombinationen. Alles Weitere legen die Länder und teilweise die
 * einzelnen Zulassungsbezirke selbst fest – diese Liste ist deshalb
 * ausdrücklich NICHT abschließend.
 *
 * Die letzte Entscheidung trifft immer die Zulassungsbehörde. Die Prüfung hier
 * fängt die eindeutigen Fälle früh ab, ersetzt aber keine Auskunft der Behörde.
 */

/** Bundesweit gesperrt (§ 8 FZV). */
export const GESPERRT_BUNDESWEIT = ["HJ", "KZ", "NS", "SA", "SS"] as const;

interface Landesregel {
  /** Zusätzlich gesperrte Buchstabenkombinationen im Erkennungsteil */
  buchstaben?: string[];
  /** Gesperrte Zahlen, unabhängig von den Buchstaben */
  zahlen?: string[];
  /** Buchstaben, die nur zusammen mit bestimmten Zahlen gesperrt sind */
  kombination?: { buchstaben: string[]; zahlen: string[] };
  /** Regeln, die nur für einzelne Unterscheidungszeichen gelten */
  proBezirk?: Record<string, { buchstaben?: string[] }>;
}

/**
 * Stand der Recherche. Vor dem Livegang mit den Vorgaben der Länder abgleichen
 * und bei Änderungen hier nachziehen.
 */
export const LANDESREGELN: Record<string, Landesregel> = {
  Hamburg: {
    buchstaben: ["SD"],
  },
  "Nordrhein-Westfalen": {
    proBezirk: {
      // "K-Z…" würde als KZ gelesen
      K: { buchstaben: ["Z"] },
    },
  },
  Bayern: {
    kombination: {
      buchstaben: ["AH", "HH"],
      zahlen: ["18", "88", "28"],
    },
    proBezirk: {
      N: { buchstaben: ["PD", "SU"] },
    },
  },
  Brandenburg: {
    zahlen: ["14", "18", "28", "88", "188", "1888", "8888", "8188"],
    kombination: {
      buchstaben: ["JN", "HH", "AH"],
      zahlen: ["18"],
    },
  },
};

export interface RegelBefund {
  /** Harte Sperre – die Kombination wird sicher nicht vergeben */
  gesperrt: string[];
  /** Weicher Hinweis – im Bezirk möglicherweise gesperrt */
  hinweise: string[];
}

export function pruefeSperren(
  unterscheidungszeichen: string,
  buchstaben: string,
  zahlen: string,
  bundesland?: string,
): RegelBefund {
  const gesperrt: string[] = [];
  const hinweise: string[] = [];

  if ((GESPERRT_BUNDESWEIT as readonly string[]).includes(buchstaben)) {
    gesperrt.push(
      `Die Buchstabenkombination „${buchstaben}“ ist bundesweit gesperrt (§ 8 FZV).`,
    );
  }

  const regel = bundesland ? LANDESREGELN[bundesland] : undefined;

  if (regel?.buchstaben?.includes(buchstaben)) {
    gesperrt.push(
      `Die Buchstabenkombination „${buchstaben}“ ist in ${bundesland} gesperrt.`,
    );
  }

  if (regel?.zahlen?.includes(zahlen)) {
    gesperrt.push(`Die Zahl „${zahlen}“ ist in ${bundesland} gesperrt.`);
  }

  if (
    regel?.kombination &&
    regel.kombination.buchstaben.includes(buchstaben) &&
    regel.kombination.zahlen.includes(zahlen)
  ) {
    gesperrt.push(
      `Die Kombination „${buchstaben} ${zahlen}“ ist in ${bundesland} gesperrt.`,
    );
  }

  const bezirksregel = regel?.proBezirk?.[unterscheidungszeichen];
  if (bezirksregel?.buchstaben?.some((b) => buchstaben.startsWith(b))) {
    gesperrt.push(
      `Im Zulassungsbezirk ${unterscheidungszeichen} ist „${unterscheidungszeichen}-${buchstaben}“ gesperrt.`,
    );
  }

  /*
   * Zahlen mit einschlägiger Bedeutung werden nicht überall, aber in vielen
   * Bezirken abgelehnt. Das ist ein Hinweis, keine Sperre – sonst würden
   * zulässige Kombinationen fälschlich abgewiesen.
   */
  if (gesperrt.length === 0 && ["18", "88", "28", "888", "1888", "8888"].includes(zahlen)) {
    hinweise.push(
      `Die Zahl „${zahlen}“ wird von manchen Zulassungsbehörden nicht vergeben. Wir prüfen das mit Ihrer Behörde ab.`,
    );
  }

  return { gesperrt, hinweise };
}
