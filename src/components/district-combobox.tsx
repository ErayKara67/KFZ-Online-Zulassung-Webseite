"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { districts, type District } from "@/lib/districts";

/**
 * Suchfeld für das Unterscheidungszeichen.
 *
 * Ersetzt die frühere Datalist: Gesucht wird nach Kürzel und Ortsname, die
 * Liste ist mit der Tastatur bedienbar und zeigt den Zulassungsbezirk direkt
 * an — wer „Herne" tippt, findet HER, ohne das Kürzel zu kennen.
 */
export function DistrictCombobox({
  value,
  onChange,
  id,
  className = "",
}: {
  value: string;
  onChange: (kuerzel: string) => void;
  id?: string;
  className?: string;
}) {
  const reactId = useId();
  const feldId = id ?? `bezirk-${reactId}`;
  const listenId = `${feldId}-liste`;

  const [suche, setSuche] = useState("");
  const [offen, setOffen] = useState(false);
  const [markiert, setMarkiert] = useState(0);
  const huelle = useRef<HTMLDivElement>(null);

  const treffer = useMemo(() => {
    const q = (suche || value).trim().toLowerCase();
    if (!q) return [];
    const nachKuerzel: District[] = [];
    const nachOrt: District[] = [];
    for (const d of districts) {
      const code = d.code.toLowerCase();
      if (code === q) nachKuerzel.unshift(d);
      else if (code.startsWith(q)) nachKuerzel.push(d);
      else if (d.city.toLowerCase().includes(q)) nachOrt.push(d);
    }
    return [...nachKuerzel, ...nachOrt].slice(0, 8);
  }, [suche, value]);

  const gewaehlt = useMemo(
    () => districts.find((d) => d.code === value.toUpperCase()),
    [value],
  );

  /* Liste schließen, wenn außerhalb geklickt wird */
  useEffect(() => {
    function beiKlick(e: MouseEvent) {
      if (huelle.current && !huelle.current.contains(e.target as Node)) {
        setOffen(false);
      }
    }
    document.addEventListener("mousedown", beiKlick);
    return () => document.removeEventListener("mousedown", beiKlick);
  }, []);

  function uebernehmen(d: District) {
    onChange(d.code);
    setSuche("");
    setOffen(false);
  }

  function beiTaste(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOffen(true);
      setMarkiert((i) => Math.min(i + 1, treffer.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMarkiert((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && offen && treffer[markiert]) {
      e.preventDefault();
      uebernehmen(treffer[markiert]);
    } else if (e.key === "Escape") {
      setOffen(false);
    }
  }

  return (
    <div ref={huelle} className={`relative ${className}`}>
      <input
        id={feldId}
        role="combobox"
        aria-expanded={offen && treffer.length > 0}
        aria-controls={listenId}
        aria-autocomplete="list"
        aria-activedescendant={
          offen && treffer[markiert] ? `${listenId}-${markiert}` : undefined
        }
        autoComplete="off"
        maxLength={12}
        placeholder="HER"
        value={suche || value}
        onChange={(e) => {
          const roh = e.target.value;
          setSuche(roh);
          setMarkiert(0);
          setOffen(true);
          /* Reine Buchstabenfolge bis 3 Zeichen gilt sofort als Kürzel */
          const kuerzel = roh.toUpperCase().replace(/[^A-ZÄÖÜ]/g, "");
          if (kuerzel.length <= 3 && kuerzel === roh.toUpperCase()) {
            onChange(kuerzel);
          }
        }}
        onFocus={() => setOffen(true)}
        onKeyDown={beiTaste}
        className="w-full rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-3.5 text-center text-xl font-bold uppercase tracking-wider text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none"
      />

      {offen && treffer.length > 0 ? (
        <ul
          id={listenId}
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1.5 max-h-64 w-[min(20rem,calc(100vw-3rem))] overflow-y-auto rounded-[var(--radius-sm)] border border-line bg-card py-1 shadow-[0_24px_48px_-16px_rgba(0,0,0,.85)]"
        >
          {treffer.map((d, i) => (
            <li key={`${d.code}-${d.city}`} id={`${listenId}-${i}`} role="option" aria-selected={i === markiert}>
              <button
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setMarkiert(i)}
                onClick={() => uebernehmen(d)}
                className={`flex w-full items-baseline gap-3 px-3 py-2 text-left ${
                  i === markiert ? "bg-raised" : ""
                }`}
              >
                <span className="w-10 shrink-0 text-sm font-bold text-accent-bright">
                  {d.code}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{d.city}</span>
                <span className="shrink-0 text-[0.75rem] sm:text-[0.7rem] text-ink-4">{d.state}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {gewaehlt && !offen ? (
        <p className="mt-1.5 truncate text-center text-[0.75rem] sm:text-[0.7rem] text-ink-3">
          {gewaehlt.city}
        </p>
      ) : null}
    </div>
  );
}
