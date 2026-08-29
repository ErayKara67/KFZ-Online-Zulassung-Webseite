"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { districts } from "@/lib/districts";
import { inputClass } from "./ui";

export function DistrictSearch() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return districts;
    return districts.filter(
      (d) =>
        d.code.toLowerCase().startsWith(q) ||
        d.city.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div>
      <div className="max-w-md">
        <label htmlFor="ds-query" className="mb-1.5 block text-sm font-medium text-ink-700">
          Zulassungsbezirk oder Kürzel suchen
        </label>
        <input
          id="ds-query"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z. B. Köln oder K"
          className={inputClass}
        />
        <p className="mt-2 text-xs text-ink-500" aria-live="polite">
          {filtered.length} Einträge
        </p>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-line">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">Zulassungsbezirke mit Unterscheidungszeichen</caption>
          <thead>
            <tr className="bg-surface text-left">
              <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Kürzel</th>
              <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Zulassungsbezirk</th>
              <th scope="col" className="px-5 py-3 font-semibold text-ink-700">Bundesland</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold text-ink-700">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={`${d.code}-${d.city}`} className="border-t border-line">
                <td className="px-5 py-3 font-bold text-ink-900">{d.code}</td>
                <td className="px-5 py-3 text-ink-700">{d.city}</td>
                <td className="px-5 py-3 text-ink-500">{d.state}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/bestellung?leistung=wunschkennzeichen&bezirk=${d.code}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Kennzeichen sichern
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr className="border-t border-line">
                <td colSpan={4} className="px-5 py-8 text-center text-ink-500">
                  Kein Treffer. Bitte prüfen Sie die Schreibweise – oder rufen Sie
                  uns an, wir finden den richtigen Bezirk für Sie.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
