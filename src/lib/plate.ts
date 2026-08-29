import { isKnownDistrict } from "./districts";

export interface PlateInput {
  district: string;
  letters: string;
  numbers: string;
}

export type PlateStatus = "available" | "reserved" | "invalid";

export interface PlateResult {
  status: PlateStatus;
  plate: string;
  input: PlateInput;
  /** Erklärtext für die Nutzerin / den Nutzer */
  message: string;
  /** Alternativvorschläge, wenn die Kombination vergeben ist */
  suggestions: PlateInput[];
  /** Fehlerdetails bei ungültiger Eingabe */
  issues: string[];
}

/** In allen Bundesländern gesperrte Buchstabenkombinationen. */
const FORBIDDEN_LETTER_COMBOS = [
  "HJ",
  "KZ",
  "NS",
  "SA",
  "SS",
  "AH",
  "HH",
  "NPD",
  "SD",
];

/** Zahlen mit einschlägiger Bedeutung, die zusammen mit bestimmten
 *  Buchstaben in vielen Bezirken nicht vergeben werden. */
const SENSITIVE_NUMBERS = ["88", "18", "1888", "8888", "888", "188"];
const SENSITIVE_LETTERS = ["AH", "HH", "HJ", "SS", "SA", "NS", "KZ", "WP"];

const UMLAUT_MAP: Record<string, string> = {
  Ä: "Ä",
  Ö: "Ö",
  Ü: "Ü",
};

export function normalizePart(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-ZÄÖÜ0-9]/g, "")
    .replace(/[ÄÖÜ]/g, (m) => UMLAUT_MAP[m] ?? m);
}

export function formatPlate(input: PlateInput): string {
  return `${input.district}-${input.letters} ${input.numbers}`.trim();
}

/** Rein syntaktische Prüfung nach FZV, Anlage 4. */
export function validatePlate(input: PlateInput): string[] {
  const issues: string[] = [];
  const district = normalizePart(input.district);
  const letters = normalizePart(input.letters);
  const numbers = normalizePart(input.numbers);

  if (!district) {
    issues.push("Bitte geben Sie ein Unterscheidungszeichen an (z. B. B, M, HH).");
  } else if (!/^[A-ZÄÖÜ]{1,3}$/.test(district)) {
    issues.push("Das Unterscheidungszeichen darf nur aus 1 bis 3 Buchstaben bestehen.");
  } else if (!isKnownDistrict(district)) {
    issues.push(
      `„${district}“ ist kein uns bekanntes Unterscheidungszeichen. Bitte prüfen Sie die Schreibweise.`,
    );
  }

  if (!/^[A-ZÄÖÜ]{1,2}$/.test(letters)) {
    issues.push("Der Buchstabenteil muss aus 1 oder 2 Buchstaben bestehen.");
  }

  if (!/^[0-9]{1,4}$/.test(numbers)) {
    issues.push("Der Zahlenteil muss aus 1 bis 4 Ziffern bestehen.");
  } else if (numbers.length > 1 && numbers.startsWith("0")) {
    issues.push("Der Zahlenteil darf nicht mit einer 0 beginnen.");
  }

  if (district.length + letters.length + numbers.length > 8) {
    issues.push("Ein Kennzeichen darf insgesamt höchstens 8 Zeichen umfassen.");
  }

  if (letters.length + numbers.length > 6) {
    issues.push("Buchstaben- und Zahlenteil dürfen zusammen höchstens 6 Zeichen haben.");
  }

  const combo = `${district}${letters}`;
  if (FORBIDDEN_LETTER_COMBOS.includes(letters) || FORBIDDEN_LETTER_COMBOS.includes(combo)) {
    issues.push(
      "Diese Buchstabenkombination wird von den Zulassungsbehörden nicht vergeben.",
    );
  }

  if (
    SENSITIVE_LETTERS.includes(letters) &&
    SENSITIVE_NUMBERS.includes(numbers)
  ) {
    issues.push(
      "Diese Kombination aus Buchstaben und Zahlen ist bundesweit gesperrt.",
    );
  }

  return issues;
}

/** Stabiler Hash, damit dieselbe Kombination immer dasselbe Ergebnis liefert. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function buildSuggestions(input: PlateInput): PlateInput[] {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const out: PlateInput[] = [];
  const base = Number(input.numbers) || 1;

  for (const delta of [1, 2, 3, 10]) {
    const next = String(base + delta);
    if (next.length <= 4) out.push({ ...input, numbers: next });
  }

  const firstLetter = input.letters.charAt(0);
  const idx = alphabet.indexOf(firstLetter);
  if (idx >= 0) {
    const alt = alphabet.charAt((idx + 1) % 26);
    out.push({ ...input, letters: alt + input.letters.slice(1) });
  }

  return out
    .filter((candidate) => validatePlate(candidate).length === 0)
    .filter((candidate) => availabilityOf(candidate) === "available")
    .slice(0, 4);
}

/**
 * DEMO-VERFÜGBARKEIT.
 *
 * Für den Produktivbetrieb wird an dieser Stelle die Schnittstelle der
 * jeweiligen Zulassungsbehörde bzw. des Dienstleisters angebunden
 * (siehe README, Abschnitt „Echte Verfügbarkeitsprüfung“).
 * Der Hash sorgt dafür, dass eine Kombination im Demobetrieb reproduzierbar
 * immer denselben Status liefert.
 */
export function availabilityOf(input: PlateInput): "available" | "reserved" {
  const key = `${input.district}|${input.letters}|${input.numbers}`;
  return hash(key) % 5 === 0 ? "reserved" : "available";
}

export function checkPlate(raw: PlateInput): PlateResult {
  const input: PlateInput = {
    district: normalizePart(raw.district),
    letters: normalizePart(raw.letters),
    numbers: normalizePart(raw.numbers),
  };

  const issues = validatePlate(input);
  const plate = formatPlate(input);

  if (issues.length > 0) {
    return {
      status: "invalid",
      plate,
      input,
      message: issues[0],
      suggestions: [],
      issues,
    };
  }

  const status = availabilityOf(input);

  if (status === "reserved") {
    return {
      status,
      plate,
      input,
      message: `${plate} ist bereits vergeben. Diese Alternativen sind frei:`,
      suggestions: buildSuggestions(input),
      issues: [],
    };
  }

  return {
    status,
    plate,
    input,
    message: `${plate} ist frei und kann sofort reserviert werden.`,
    suggestions: [],
    issues: [],
  };
}
