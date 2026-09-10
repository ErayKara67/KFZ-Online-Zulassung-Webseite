"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  antriebe,
  ermittleSchadstoffgruppe,
  euroNormen,
  type Antrieb,
  type EuroNorm,
} from "@/lib/plakette";
import { Button, Check } from "./ui";

/**
 * Sichtbare Plakette. Die Farben sind amtlich vorgegeben (RAL) und deshalb
 * bewusst fest, unabhängig vom Erscheinungsbild der Seite.
 */
function Plakette({
  farbe,
  gruppe,
  kennzeichen,
}: {
  farbe: "keine" | "rot" | "gelb" | "gruen";
  gruppe: number;
  kennzeichen: string;
}) {
  if (farbe === "keine") {
    return (
      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-dashed border-line-lit text-center text-[0.65rem] font-semibold leading-tight text-ink-3">
        Keine
        <br />
        Plakette
      </div>
    );
  }

  const toene = {
    rot: { ring: "#cc0605", ziffer: "#cc0605" },
    gelb: { ring: "#e6b800", ziffer: "#a37a00" },
    gruen: { ring: "#008351", ziffer: "#008351" },
  }[farbe];

  return (
    <div
      className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full bg-white shadow-[0_12px_30px_-12px_rgba(0,0,0,.9)]"
      style={{ border: `10px solid ${toene.ring}` }}
      aria-hidden="true"
    >
      <span className="text-4xl font-black leading-none" style={{ color: toene.ziffer }}>
        {gruppe}
      </span>
      {kennzeichen ? (
        <span className="absolute bottom-2 max-w-[5.2rem] truncate text-[0.5rem] font-bold uppercase tracking-tight text-[#111]">
          {kennzeichen}
        </span>
      ) : null}
    </div>
  );
}

export function PlaketteChecker({ kennzeichen = "" }: { kennzeichen?: string }) {
  const router = useRouter();
  const [antrieb, setAntrieb] = useState<Antrieb>("benzin");
  const [euroNorm, setEuroNorm] = useState<EuroNorm>("4");
  const [partikelfilter, setPartikelfilter] = useState(false);
  const [katalysator, setKatalysator] = useState(true);
  const [gezeigt, setGezeigt] = useState(false);

  const istDiesel = antrieb === "diesel";
  const istOtto = antrieb === "benzin" || antrieb === "gas" || antrieb === "hybrid";

  const ergebnis = useMemo(
    () => ermittleSchadstoffgruppe({ antrieb, euroNorm, partikelfilter, katalysator }),
    [antrieb, euroNorm, partikelfilter, katalysator],
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-card p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)]">
      <h2 className="text-base font-bold tracking-tight text-ink">
        Welche Plakette bekommt Ihr Fahrzeug?
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
        Drei Angaben aus der Zulassungsbescheinigung genügen für eine
        Voreinschätzung.
      </p>

      <div className="mt-6 space-y-5">
        <fieldset>
          <legend className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
            Antriebsart
          </legend>
          <div className="flex flex-wrap gap-2">
            {antriebe.map((a) => (
              <button
                key={a.wert}
                type="button"
                onClick={() => {
                  setAntrieb(a.wert);
                  setGezeigt(false);
                }}
                aria-pressed={antrieb === a.wert}
                className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  antrieb === a.wert
                    ? "border-accent bg-accent-veil text-accent-bright"
                    : "border-line bg-raised text-ink-2 hover:border-line-lit hover:text-ink"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </fieldset>

        {istDiesel ? (
          <>
            <div>
              <label
                htmlFor="pk-norm"
                className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3"
              >
                Schadstoffklasse — Feld 14 der Zulassungsbescheinigung
              </label>
              <select
                id="pk-norm"
                value={euroNorm}
                onChange={(e) => {
                  setEuroNorm(e.target.value as EuroNorm);
                  setGezeigt(false);
                }}
                className="w-full rounded-[var(--radius-sm)] border border-line bg-raised px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              >
                {euroNormen.map((n) => (
                  <option key={n.wert} value={n.wert}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <label htmlFor="pk-filter" className="flex cursor-pointer items-start gap-3 text-sm text-ink-2">
              <input
                id="pk-filter"
                type="checkbox"
                checked={partikelfilter}
                onChange={(e) => {
                  setPartikelfilter(e.target.checked);
                  setGezeigt(false);
                }}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
              />
              <span className="leading-relaxed">
                Dieselpartikelfilter vorhanden — ab Werk oder nachgerüstet
              </span>
            </label>
          </>
        ) : null}

        {istOtto ? (
          <label htmlFor="pk-kat" className="flex cursor-pointer items-start gap-3 text-sm text-ink-2">
            <input
              id="pk-kat"
              type="checkbox"
              checked={katalysator}
              onChange={(e) => {
                setKatalysator(e.target.checked);
                setGezeigt(false);
              }}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="leading-relaxed">
              Geregelter Katalysator vorhanden — bei Fahrzeugen ab Baujahr 1993
              praktisch immer der Fall
            </span>
          </label>
        ) : null}
      </div>

      <Button size="lg" className="mt-6 w-full" onClick={() => setGezeigt(true)}>
        Plakette ermitteln
      </Button>

      {gezeigt ? (
        <div className="mt-6 border-t border-line pt-6" aria-live="polite">
          <div className="flex items-center gap-5">
            <Plakette
              farbe={ergebnis.farbe}
              gruppe={ergebnis.gruppe}
              kennzeichen={kennzeichen}
            />
            <div className="min-w-0">
              <p
                className={`text-lg font-bold tracking-tight ${
                  ergebnis.umweltzoneGruen ? "text-ok" : "text-ink"
                }`}
              >
                {ergebnis.bezeichnung}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-3">
                Schadstoffgruppe {ergebnis.gruppe}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-2">
                {ergebnis.begruendung}
              </p>
            </div>
          </div>

          {ergebnis.umweltzoneGruen ? (
            <p className="mt-5 flex items-start gap-2 rounded-[var(--radius-sm)] bg-ok-veil px-4 py-3 text-sm font-medium text-ok">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              Damit dürfen Sie in alle deutschen Umweltzonen einfahren.
            </p>
          ) : (
            <p className="mt-5 rounded-[var(--radius-sm)] bg-warn-veil px-4 py-3 text-sm text-warn">
              Nahezu alle deutschen Umweltzonen setzen die grüne Plakette voraus.
              {ergebnis.verbesserung ? ` ${ergebnis.verbesserung}` : ""}
            </p>
          )}

          <p className="mt-4 text-xs leading-relaxed text-ink-3">
            Voreinschätzung. Verbindlich ist die Emissionsschlüsselnummer in Feld
            14.1 Ihrer Zulassungsbescheinigung — wir gleichen sie vor dem Versand
            ab und melden uns, falls sich eine andere Gruppe ergibt.
          </p>

          {ergebnis.gruppe === 4 ? (
            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={() => router.push("/bestellung?leistung=umweltplakette")}
            >
              Grüne Plakette bestellen
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
