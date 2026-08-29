import { districts, isKnownDistrict } from "./districts";
import { pruefeSperren } from "./plate-rules";
import { pruefeVerfuegbarkeit, verfuegbarkeitLive } from "./plate-availability";

export interface PlateInput {
  district: string;
  letters: string;
  numbers: string;
}

/**
 * `frei` und `vergeben` setzen eine angebundene Behörden- bzw.
 * Dienstleisterschnittstelle voraus. Ohne sie ist das bestmögliche Ergebnis
 * `formal_ok`: Die Kombination ist nach den Formvorschriften zulässig, über
 * die Verfügbarkeit ist damit nichts gesagt.
 */
export type PlateStatus = "frei" | "vergeben" | "formal_ok" | "ungueltig";

export interface PlateResult {
  status: PlateStatus;
  plate: string;
  input: PlateInput;
  message: string;
  /** Harte Fehler – die Eingabe ist so nicht zulässig */
  issues: string[];
  /** Weiche Hinweise – zulässig, aber erklärungsbedürftig */
  hinweise: string[];
  suggestions: PlateInput[];
  /** true, solange keine Live-Verfügbarkeitsprüfung angebunden ist */
  ohneLivePruefung: boolean;
  bundesland?: string;
  zulassungsbezirk?: string;
}

const UMLAUTE = /[ÄÖÜ]/;

export function normalizePart(value: string): string {
  return value.toUpperCase().replace(/[^A-ZÄÖÜ0-9]/g, "");
}

export function formatPlate(input: PlateInput): string {
  return `${input.district}-${input.letters} ${input.numbers}`.trim();
}

function bezirkZu(code: string) {
  return districts.find((d) => d.code === code.toUpperCase());
}

/**
 * Formprüfung nach den Vorgaben der FZV:
 * 1 bis 3 Buchstaben Unterscheidungszeichen, 1 bis 2 Buchstaben und
 * 1 bis 4 Ziffern im Erkennungsteil, insgesamt höchstens 8 Zeichen,
 * keine führende Null.
 */
export function validatePlate(input: PlateInput): {
  issues: string[];
  hinweise: string[];
} {
  const issues: string[] = [];
  const hinweise: string[] = [];

  const district = normalizePart(input.district);
  const letters = normalizePart(input.letters);
  const numbers = normalizePart(input.numbers);

  if (!district) {
    issues.push("Bitte geben Sie ein Unterscheidungszeichen an (z. B. B, M, HH).");
  } else if (!/^[A-ZÄÖÜ]{1,3}$/.test(district)) {
    issues.push("Das Unterscheidungszeichen darf nur aus 1 bis 3 Buchstaben bestehen.");
  } else if (!isKnownDistrict(district)) {
    /*
     * Unsere Kürzelliste ist ein Auszug, kein amtliches Verzeichnis. Ein
     * unbekanntes Kürzel darf deshalb nicht zur Ablehnung führen – sonst
     * weisen wir gültige Eingaben ab.
     */
    hinweise.push(
      `„${district}“ steht nicht in unserer Kürzelliste. Falls es Ihr Zulassungsbezirk ist, prüfen wir das für Sie – die Liste ist nicht vollständig.`,
    );
  }

  if (!/^[A-ZÄÖÜ]{1,2}$/.test(letters)) {
    issues.push("Der Buchstabenteil muss aus 1 oder 2 Buchstaben bestehen.");
  } else if (UMLAUTE.test(letters)) {
    hinweise.push("Umlaute im Erkennungsteil werden nicht von allen Behörden vergeben.");
  }

  if (!/^[0-9]{1,4}$/.test(numbers)) {
    issues.push("Der Zahlenteil muss aus 1 bis 4 Ziffern bestehen.");
  } else if (numbers.length > 1 && numbers.startsWith("0")) {
    issues.push("Der Zahlenteil darf nicht mit einer 0 beginnen.");
  }

  if (district.length + letters.length + numbers.length > 8) {
    issues.push("Ein Kennzeichen darf insgesamt höchstens 8 Zeichen umfassen.");
  }

  if (issues.length === 0) {
    const befund = pruefeSperren(district, letters, numbers, bezirkZu(district)?.state);
    issues.push(...befund.gesperrt);
    hinweise.push(...befund.hinweise);
  }

  return { issues, hinweise };
}

function vorschlaege(input: PlateInput): PlateInput[] {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const kandidaten: PlateInput[] = [];
  const basis = Number(input.numbers) || 1;

  for (const abstand of [1, 2, 3, 10]) {
    const naechste = String(basis + abstand);
    if (naechste.length <= 4) kandidaten.push({ ...input, numbers: naechste });
  }

  const index = alphabet.indexOf(input.letters.charAt(0));
  if (index >= 0) {
    kandidaten.push({
      ...input,
      letters: alphabet.charAt((index + 1) % 26) + input.letters.slice(1),
    });
  }

  return kandidaten
    .filter((k) => validatePlate(k).issues.length === 0)
    .slice(0, 4);
}

export async function checkPlate(raw: PlateInput): Promise<PlateResult> {
  const input: PlateInput = {
    district: normalizePart(raw.district),
    letters: normalizePart(raw.letters),
    numbers: normalizePart(raw.numbers),
  };

  const plate = formatPlate(input);
  const bezirk = bezirkZu(input.district);
  const { issues, hinweise } = validatePlate(input);

  const basis = {
    plate,
    input,
    issues,
    hinweise,
    ohneLivePruefung: !verfuegbarkeitLive,
    bundesland: bezirk?.state,
    zulassungsbezirk: bezirk?.city,
  };

  if (issues.length > 0) {
    return {
      ...basis,
      status: "ungueltig",
      message: issues[0],
      suggestions: [],
    };
  }

  const verfuegbarkeit = await pruefeVerfuegbarkeit(input);

  if (verfuegbarkeit === "vergeben") {
    return {
      ...basis,
      status: "vergeben",
      message: `${plate} ist bereits vergeben. Diese Alternativen sind frei:`,
      suggestions: vorschlaege(input),
    };
  }

  if (verfuegbarkeit === "frei") {
    return {
      ...basis,
      status: "frei",
      message: `${plate} ist frei und kann reserviert werden.`,
      suggestions: [],
    };
  }

  /*
   * Kein Live-Ergebnis: Wir sagen genau das – und behaupten keine
   * Verfügbarkeit, die wir nicht geprüft haben.
   */
  return {
    ...basis,
    status: "formal_ok",
    message: `${plate} ist als Kennzeichen zulässig.`,
    suggestions: [],
  };
}
