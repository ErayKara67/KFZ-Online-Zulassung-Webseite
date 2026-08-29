"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { districts, findDistricts } from "@/lib/districts";
import type { PlateResult } from "@/lib/plate";
import { LicensePlate } from "./license-plate";
import { Button, Check } from "./ui";

const clean = (v: string, pattern: RegExp) =>
  v.toUpperCase().replace(pattern, "");

export function PlateChecker({
  compact = false,
  service = "wunschkennzeichen",
}: {
  compact?: boolean;
  service?: string;
}) {
  const router = useRouter();
  const [district, setDistrict] = useState("");
  const [letters, setLetters] = useState("");
  const [numbers, setNumbers] = useState("");
  const [result, setResult] = useState<PlateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lettersRef = useRef<HTMLInputElement>(null);
  const numbersRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => findDistricts(district, 6), [district]);
  const districtName = useMemo(
    () => districts.find((d) => d.code === district.toUpperCase())?.city,
    [district],
  );

  async function check(
    values = { district, letters, numbers },
  ) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kennzeichen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Anfrage fehlgeschlagen");
      const data: PlateResult = await res.json();
      setResult(data);
    } catch {
      setError(
        "Die Prüfung ist gerade nicht möglich. Bitte versuchen Sie es in einem Moment erneut.",
      );
    } finally {
      setLoading(false);
    }
  }

  function reserve(p: { district: string; letters: string; numbers: string }) {
    const params = new URLSearchParams({
      leistung: service,
      bezirk: p.district,
      buchstaben: p.letters,
      zahlen: p.numbers,
    });
    router.push(`/bestellung?${params.toString()}`);
  }

  return (
    <div
      className={`rounded-[var(--radius-card)] border border-line bg-white ${
        compact ? "p-5" : "p-6 sm:p-8"
      } shadow-[0_18px_45px_-30px_rgba(11,46,91,0.55)]`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void check();
        }}
        noValidate
      >
        <fieldset>
          <legend className="text-base font-semibold text-ink-900">
            Wunschkennzeichen auf Verfügbarkeit prüfen
          </legend>
          <p className="mt-1 text-sm text-ink-500">
            Ortskürzel, Buchstaben und Zahlen eingeben – das Ergebnis erscheint sofort.
          </p>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3">
            <div>
              <label htmlFor="pc-district" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                Ort
              </label>
              <input
                id="pc-district"
                list="pc-districts"
                inputMode="text"
                autoComplete="off"
                maxLength={3}
                placeholder="B"
                value={district}
                onChange={(e) => {
                  const v = clean(e.target.value, /[^A-ZÄÖÜ]/g);
                  setDistrict(v);
                  if (v.length === 3) lettersRef.current?.focus();
                }}
                className="w-full rounded-lg border border-line bg-white px-3 py-3 text-center text-xl font-bold uppercase tracking-wider focus:border-brand-600 focus:outline-none"
              />
              <datalist id="pc-districts">
                {matches.map((d) => (
                  <option key={`${d.code}-${d.city}`} value={d.code}>
                    {d.city}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="pc-letters" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                Buchstaben
              </label>
              <input
                id="pc-letters"
                ref={lettersRef}
                autoComplete="off"
                maxLength={2}
                placeholder="AB"
                value={letters}
                onChange={(e) => {
                  const v = clean(e.target.value, /[^A-ZÄÖÜ]/g);
                  setLetters(v);
                  if (v.length === 2) numbersRef.current?.focus();
                }}
                className="w-full rounded-lg border border-line bg-white px-3 py-3 text-center text-xl font-bold uppercase tracking-wider focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="pc-numbers" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                Zahlen
              </label>
              <input
                id="pc-numbers"
                ref={numbersRef}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="1234"
                value={numbers}
                onChange={(e) => setNumbers(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full rounded-lg border border-line bg-white px-3 py-3 text-center text-xl font-bold tracking-wider focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>

          {districtName ? (
            <p className="mt-2 text-xs text-ink-500">
              Zulassungsbezirk: <span className="font-medium text-ink-700">{districtName}</span>
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Prüfe …" : "Verfügbarkeit prüfen"}
              {!loading ? <span aria-hidden="true">→</span> : null}
            </Button>
            <p className="text-xs text-ink-500">
              Kostenlos und unverbindlich. Reservierung erst nach Ihrer Bestätigung.
            </p>
          </div>
        </fieldset>
      </form>

      <div className="mt-6 border-t border-line pt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
          Vorschau
        </p>
        <LicensePlate district={district} letters={letters} numbers={numbers} />
      </div>

      <div aria-live="polite">
        {error ? (
          <p className="mt-5 rounded-lg bg-bad-100 px-4 py-3 text-sm font-medium text-bad-700">
            {error}
          </p>
        ) : null}

        {result?.status === "available" ? (
          <div className="mt-5 rounded-lg border border-ok-700/20 bg-ok-100 p-5">
            <p className="flex items-start gap-2 text-sm font-semibold text-ok-700">
              <Check /> {result.message}
            </p>
            <Button
              className="mt-4 w-full sm:w-auto"
              size="lg"
              onClick={() => reserve(result.input)}
            >
              Jetzt reservieren
            </Button>
          </div>
        ) : null}

        {result?.status === "reserved" ? (
          <div className="mt-5 rounded-lg border border-warn-700/20 bg-warn-100 p-5">
            <p className="text-sm font-semibold text-warn-700">{result.message}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {result.suggestions.map((s) => (
                <li key={`${s.letters}${s.numbers}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setDistrict(s.district);
                      setLetters(s.letters);
                      setNumbers(s.numbers);
                      void check(s);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink-900 hover:border-brand-500"
                  >
                    <span>
                      {s.district}-{s.letters} {s.numbers}
                    </span>
                    <span className="text-xs font-medium text-ok-700">frei</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result?.status === "invalid" ? (
          <div className="mt-5 rounded-lg border border-bad-700/20 bg-bad-100 p-5">
            <p className="text-sm font-semibold text-bad-700">
              Die Eingabe ist so nicht zulässig
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-bad-700">
              {result.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
