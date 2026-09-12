"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlateInput, PlateResult } from "@/lib/plate";
import { brand } from "@/lib/brand";
import { LicensePlate } from "./license-plate";
import { DistrictCombobox } from "./district-combobox";
import { Button, Check } from "./ui";

type Modus = "pruefen" | "ideen";

const MERKLISTE_KEY = "kennzeichen-merkliste";

function schluessel(p: PlateInput) {
  return `${p.district}-${p.letters}-${p.numbers}`;
}

export function PlateChecker({
  compact = false,
  service = "wunschkennzeichen",
}: {
  compact?: boolean;
  service?: string;
}) {
  const router = useRouter();
  const [modus, setModus] = useState<Modus>("pruefen");

  const [district, setDistrict] = useState<string>(brand.heimatkuerzel);
  const [letters, setLetters] = useState("");
  const [numbers, setNumbers] = useState("");

  const [initialen, setInitialen] = useState("");
  const [zahl, setZahl] = useState("");

  const [ergebnis, setErgebnis] = useState<PlateResult | null>(null);
  const [vorschlaege, setVorschlaege] = useState<PlateResult[] | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [merkliste, setMerkliste] = useState<PlateInput[]>([]);

  const zahlenFeld = useRef<HTMLInputElement>(null);

  /* Merkliste aus der Sitzung wiederherstellen */
  useEffect(() => {
    try {
      const roh = sessionStorage.getItem(MERKLISTE_KEY);
      // Wiederherstellung aus der Sitzung – der State wird nur einmal gesetzt.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (roh) setMerkliste(JSON.parse(roh) as PlateInput[]);
    } catch {
      /* ohne Merkliste weiter */
    }
  }, []);

  const merken = useCallback((eintraege: PlateInput[]) => {
    setMerkliste(eintraege);
    try {
      sessionStorage.setItem(MERKLISTE_KEY, JSON.stringify(eintraege));
    } catch {
      /* Speicher nicht verfügbar */
    }
  }, []);

  async function pruefen(werte: PlateInput = { district, letters, numbers }) {
    setLaedt(true);
    setFehler(null);
    setVorschlaege(null);
    try {
      const antwort = await fetch("/api/kennzeichen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(werte),
      });
      if (!antwort.ok) throw new Error("Anfrage fehlgeschlagen");
      setErgebnis((await antwort.json()) as PlateResult);
    } catch {
      setFehler("Die Prüfung ist gerade nicht möglich. Bitte gleich noch einmal versuchen.");
    } finally {
      setLaedt(false);
    }
  }

  async function ideenHolen() {
    setLaedt(true);
    setFehler(null);
    setErgebnis(null);
    try {
      const antwort = await fetch("/api/kennzeichen/vorschlaege", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district, initialen, zahl }),
      });
      if (!antwort.ok) throw new Error("Anfrage fehlgeschlagen");
      const daten = (await antwort.json()) as { vorschlaege: PlateResult[] };
      setVorschlaege(daten.vorschlaege);
    } catch {
      setFehler("Die Vorschläge lassen sich gerade nicht laden.");
    } finally {
      setLaedt(false);
    }
  }

  function uebernehmen(p: PlateInput) {
    setDistrict(p.district);
    setLetters(p.letters);
    setNumbers(p.numbers);
    setModus("pruefen");
    void pruefen(p);
  }

  function beauftragen(p: PlateInput) {
    const params = new URLSearchParams({
      leistung: service,
      bezirk: p.district,
      buchstaben: p.letters,
      zahlen: p.numbers,
    });
    router.push(`/bestellung?${params.toString()}`);
  }

  function umschaltenMerken(p: PlateInput) {
    const k = schluessel(p);
    const drin = merkliste.some((m) => schluessel(m) === k);
    merken(drin ? merkliste.filter((m) => schluessel(m) !== k) : [...merkliste, p].slice(-6));
  }

  const aktuellGemerkt = merkliste.some(
    (m) => schluessel(m) === schluessel({ district, letters, numbers }),
  );

  return (
    <div
      className={`rounded-[var(--radius-card)] border border-line bg-card ${
        compact ? "p-5" : "p-6 sm:p-7"
      } shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)]`}
    >
      {/* Umschalter */}
      <div role="tablist" aria-label="Art der Suche" className="mb-6 flex gap-1 rounded-[var(--radius-sm)] bg-raised p-1">
        {([
          ["pruefen", "Kombination prüfen"],
          ["ideen", "Vorschläge finden"],
        ] as const).map(([wert, beschriftung]) => (
          <button
            key={wert}
            role="tab"
            type="button"
            aria-selected={modus === wert}
            onClick={() => setModus(wert)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              modus === wert
                ? "bg-accent text-[var(--color-on-accent)]"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {beschriftung}
          </button>
        ))}
      </div>

      {modus === "pruefen" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void pruefen();
          }}
          noValidate
        >
          <fieldset>
            <legend className="sr-only">Wunschkennzeichen prüfen</legend>

            <div className="grid grid-cols-[1.15fr_0.85fr_1fr] gap-2.5">
              <div>
                <label htmlFor="pc-district" className="mb-1.5 block text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Ort
                </label>
                <DistrictCombobox id="pc-district" value={district} onChange={setDistrict} />
              </div>

              <div>
                <label htmlFor="pc-letters" className="mb-1.5 block text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Buchst.
                </label>
                <input
                  id="pc-letters"
                  autoComplete="off"
                  maxLength={2}
                  placeholder="AB"
                  value={letters}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase().replace(/[^A-ZÄÖÜ]/g, "");
                    setLetters(v);
                    if (v.length === 2) zahlenFeld.current?.focus();
                  }}
                  className="w-full rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-3.5 text-center text-xl font-bold uppercase tracking-wider text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="pc-numbers" className="mb-1.5 block text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Zahlen
                </label>
                <input
                  id="pc-numbers"
                  ref={zahlenFeld}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  placeholder="1234"
                  value={numbers}
                  onChange={(e) => setNumbers(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-3.5 text-center text-xl font-bold tracking-wider text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none tnum"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <span className="sm:hidden">
                <LicensePlate district={district} letters={letters} numbers={numbers} size="sm" />
              </span>
              <span className="hidden sm:inline-flex">
                <LicensePlate
                  district={district}
                  letters={letters}
                  numbers={numbers}
                  size={compact ? "md" : "lg"}
                />
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button type="submit" size="lg" disabled={laedt} className="flex-1">
                {laedt ? "Prüfe …" : "Kennzeichen prüfen"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => umschaltenMerken({ district, letters, numbers })}
                disabled={!letters || !numbers}
                aria-pressed={aktuellGemerkt}
                className="sm:w-auto"
              >
                {aktuellGemerkt ? "Gemerkt ✓" : "Merken"}
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-ink-3">
              Kostenlos und unverbindlich — reserviert wird erst nach Ihrer Bestätigung.
            </p>
          </fieldset>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ideenHolen();
          }}
          noValidate
        >
          <fieldset>
            <legend className="text-base font-semibold text-ink">
              Was soll auf dem Schild stehen?
            </legend>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
              Initialen und eine Zahl genügen — wir bauen daraus zulässige
              Kombinationen und prüfen sie sofort.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="id-district" className="mb-1.5 block text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Ort
                </label>
                <DistrictCombobox id="id-district" value={district} onChange={setDistrict} />
              </div>
              <div>
                <label htmlFor="id-initialen" className="mb-1.5 block text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Initialen
                </label>
                <input
                  id="id-initialen"
                  maxLength={2}
                  placeholder="EK"
                  value={initialen}
                  onChange={(e) => setInitialen(e.target.value.toUpperCase().replace(/[^A-ZÄÖÜ]/g, ""))}
                  className="w-full rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-3.5 text-center text-xl font-bold uppercase tracking-wider text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="id-zahl" className="mb-1.5 block text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                  Zahl
                </label>
                <input
                  id="id-zahl"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1993"
                  value={zahl}
                  onChange={(e) => setZahl(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-3.5 text-center text-xl font-bold tracking-wider text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none tnum"
                />
              </div>
            </div>

            <Button type="submit" size="lg" disabled={laedt} className="mt-5 w-full">
              {laedt ? "Suche …" : "Vorschläge anzeigen"}
            </Button>
            <p className="mt-3 text-center text-xs text-ink-3">
              Geburtsjahr, Hausnummer, Hochzeitstag — alles möglich.
            </p>
          </fieldset>
        </form>
      )}

      {/* Ergebnisbereich */}
      <div aria-live="polite">
        {fehler ? (
          <p className="mt-6 rounded-[var(--radius-sm)] bg-risk-veil px-4 py-3 text-sm font-medium text-risk">
            {fehler}
          </p>
        ) : null}

        {ergebnis && ergebnis.status !== "ungueltig" && ergebnis.hinweise.length > 0 ? (
          <ul className="mt-6 space-y-2 rounded-[var(--radius-sm)] border border-warn/25 bg-warn-veil p-4 text-sm text-warn">
            {ergebnis.hinweise.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}

        {ergebnis?.status === "formal_ok" ? (
          <Ergebniskasten
            ton="neutral"
            titel={ergebnis.message}
            text="Ob die Kombination noch frei ist, bestätigt Ihre Zulassungsbehörde. Wir fragen das für Sie ab und melden uns."
            fussnote={
              ergebnis.zulassungsbezirk
                ? `Zuständig: ${ergebnis.zulassungsbezirk}${ergebnis.bundesland ? `, ${ergebnis.bundesland}` : ""}`
                : undefined
            }
            aktion={
              <Button size="lg" onClick={() => beauftragen(ergebnis.input)} className="w-full sm:w-auto">
                Kennzeichen anfragen
              </Button>
            }
          />
        ) : null}

        {ergebnis?.status === "frei" ? (
          <Ergebniskasten
            ton="ok"
            titel={ergebnis.message}
            aktion={
              <Button size="lg" onClick={() => beauftragen(ergebnis.input)} className="w-full sm:w-auto">
                Jetzt reservieren
              </Button>
            }
          />
        ) : null}

        {ergebnis?.status === "vergeben" ? (
          <div className="mt-6 rounded-[var(--radius-sm)] border border-warn/25 bg-warn-veil p-5">
            <p className="text-sm font-semibold text-warn">{ergebnis.message}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {ergebnis.suggestions.map((s) => (
                <li key={schluessel(s)}>
                  <button
                    type="button"
                    onClick={() => uebernehmen(s)}
                    className="flex w-full items-center justify-between rounded-[var(--radius-sm)] border border-line bg-card px-4 py-3 text-sm font-semibold text-ink hover:border-accent"
                  >
                    <span>{s.district}-{s.letters} {s.numbers}</span>
                    <span className="text-xs font-medium text-ok">frei</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {ergebnis?.status === "ungueltig" ? (
          <div className="mt-6 rounded-[var(--radius-sm)] border border-risk/25 bg-risk-veil p-5">
            <p className="text-sm font-semibold text-risk">So ist die Eingabe nicht zulässig</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-risk/90">
              {ergebnis.issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {vorschlaege ? (
          vorschlaege.length > 0 ? (
            <div className="mt-6">
              <p className="mb-3 text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                {vorschlaege.length} Vorschläge
              </p>
              <ul className="grid gap-2.5">
                {vorschlaege.map((v) => (
                  <li key={v.plate}>
                    <div className="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-line bg-raised p-2.5">
                      <LicensePlate
                        district={v.input.district}
                        letters={v.input.letters}
                        numbers={v.input.numbers}
                        size="xs"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-ink-3">
                        {v.status === "frei"
                          ? "frei"
                          : v.status === "vergeben"
                            ? "vergeben"
                            : "zulässig"}
                      </span>
                      <button
                        type="button"
                        onClick={() => umschaltenMerken(v.input)}
                        className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink-2 hover:border-accent hover:text-ink"
                      >
                        {merkliste.some((m) => schluessel(m) === schluessel(v.input)) ? "✓" : "Merken"}
                      </button>
                      <button
                        type="button"
                        onClick={() => beauftragen(v.input)}
                        className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-[var(--color-on-accent)] hover:bg-accent-bright"
                      >
                        Wählen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-6 rounded-[var(--radius-sm)] bg-raised px-4 py-3 text-sm text-ink-2">
              Aus diesen Angaben ließ sich keine zulässige Kombination bauen.
              Versuchen Sie eine andere Zahl oder andere Buchstaben.
            </p>
          )
        ) : null}

        {/* Merkliste */}
        {merkliste.length > 0 ? (
          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
                Gemerkt
              </p>
              <button
                type="button"
                onClick={() => merken([])}
                className="text-xs text-ink-3 hover:text-ink"
              >
                Liste leeren
              </button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {merkliste.map((m) => (
                <li key={schluessel(m)}>
                  <button
                    type="button"
                    onClick={() => uebernehmen(m)}
                    className="flex items-center rounded-lg border border-line bg-raised p-1 hover:border-accent"
                  >
                    <LicensePlate
                      district={m.district}
                      letters={m.letters}
                      numbers={m.numbers}
                      size="xs"
                      seal={false}
                    />
                    <span className="sr-only">
                      {m.district}-{m.letters} {m.numbers} erneut prüfen
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Ergebniskasten({
  ton,
  titel,
  text,
  fussnote,
  aktion,
}: {
  ton: "ok" | "neutral";
  titel: string;
  text?: string;
  fussnote?: string;
  aktion: React.ReactNode;
}) {
  const toene = {
    ok: "border-ok/30 bg-ok-veil",
    neutral: "border-accent/30 bg-accent-veil",
  } as const;
  const schrift = ton === "ok" ? "text-ok" : "text-accent-bright";

  return (
    <div className={`mt-6 rounded-[var(--radius-sm)] border p-5 ${toene[ton]}`}>
      <p className={`flex items-start gap-2 text-sm font-semibold ${schrift}`}>
        <Check className="h-5 w-5" /> {titel}
      </p>
      {text ? <p className="mt-2 text-sm leading-relaxed text-ink-2">{text}</p> : null}
      {fussnote ? <p className="mt-2 text-xs text-ink-3">{fussnote}</p> : null}
      <div className="mt-4">{aktion}</div>
    </div>
  );
}
