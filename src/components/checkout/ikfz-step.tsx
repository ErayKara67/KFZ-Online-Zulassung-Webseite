"use client";

import { useMemo } from "react";
import { pruefeEligibility, NACHWEIS_GUELTIGKEIT_TAGE } from "@/lib/ikfz/eligibility";
import { Field, inputClass, Check } from "../ui";

export interface IkfzDraft {
  sicherheitscodeZb2: string;
  sicherheitscodeZb1: string;
  zb2AusgestelltAm: string;
  zb1AusgestelltAm: string;
  identVerfahren: "eid" | "identanbieter" | "elster";
  schilderWeg: "express" | "vorhanden";
  bestaetigung: boolean;
}

const identOptionen = [
  {
    id: "eid" as const,
    titel: "Online-Ausweisfunktion (eID)",
    text: "Personalausweis mit aktivierter PIN und AusweisApp auf dem Smartphone. Vertrauensniveau „hoch“, direkt und kostenfrei.",
  },
  {
    id: "identanbieter" as const,
    titel: "Identifizierung über Anbieter",
    text: "Video- oder KI-gestützte Identifizierung über einen Vertrauensdiensteanbieter – für alle ohne aktivierte Ausweis-PIN.",
  },
  {
    id: "elster" as const,
    titel: "ELSTER-Unternehmenskonto",
    text: "Für Firmenfahrzeuge: Identifizierung über das Organisationszertifikat des Unternehmens.",
  },
];

export function IkfzStep({
  value,
  onChange,
  errors,
  vorgang,
  istFirma,
  evb,
  iban,
  huGueltigBis,
}: {
  value: IkfzDraft;
  onChange: (patch: Partial<IkfzDraft>) => void;
  errors: Record<string, string>;
  vorgang: "neuzulassung" | "umschreibung";
  istFirma: boolean;
  evb: string;
  iban: string;
  huGueltigBis: string;
}) {
  const pruefung = useMemo(
    () =>
      pruefeEligibility({
        vorgang,
        zb1AusgestelltAm: value.zb1AusgestelltAm,
        zb2AusgestelltAm: value.zb2AusgestelltAm,
        sicherheitscodeZb1: value.sicherheitscodeZb1,
        sicherheitscodeZb2: value.sicherheitscodeZb2,
        huGueltigBis,
        evb,
        iban,
        identVerfahren: value.identVerfahren,
        istFirma,
        schilderVorhanden: Boolean(value.schilderWeg),
      }),
    [value, vorgang, istFirma, evb, iban, huGueltigBis],
  );

  return (
    <section>
      <div className="mb-7">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Sofortzulassung nach i-Kfz Stufe 4
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Damit die Behörde automatisiert entscheiden kann, brauchen wir die
          verdeckten Sicherheitscodes aus Ihren Fahrzeugpapieren. Danach dürfen
          Sie mit dem vorläufigen Zulassungsnachweis {NACHWEIS_GUELTIGKEIT_TAGE}{" "}
          Kalendertage fahren, während Papiere und Plaketten per Post kommen.
        </p>
      </div>

      {/* Sicherheitscodes */}
      <fieldset className="mb-9">
        <legend className="mb-1 text-sm font-semibold text-ink">
          Sicherheitscodes aus den Fahrzeugpapieren
        </legend>
        <p className="mb-5 text-xs leading-relaxed text-ink-2">
          Die Codes stehen unter einem silbernen Feld, das Sie freirubbeln. Legen
          Sie es erst frei, wenn Sie den Auftrag abschließen – ein einmal
          freigelegtes Feld gilt als verbraucht.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Sicherheitscode Zulassungsbescheinigung Teil II"
            htmlFor="ik-code2"
            required
            hint="12 Zeichen, auf der Rückseite von Teil II."
            error={errors["ikfz.sicherheitscodeZb2"]}
          >
            <input
              id="ik-code2"
              maxLength={12}
              value={value.sicherheitscodeZb2}
              onChange={(e) =>
                onChange({
                  sicherheitscodeZb2: e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, ""),
                })
              }
              className={`${inputClass} font-mono uppercase tracking-widest`}
            />
          </Field>

          <Field
            label="Teil II ausgestellt am"
            htmlFor="ik-datum2"
            required
            hint="Nur Papiere ab dem 01.01.2018 tragen einen Sicherheitscode."
            error={errors["ikfz.zb2AusgestelltAm"]}
          >
            <input
              id="ik-datum2"
              type="date"
              value={value.zb2AusgestelltAm}
              onChange={(e) => onChange({ zb2AusgestelltAm: e.target.value })}
              className={inputClass}
            />
          </Field>

          {vorgang === "umschreibung" ? (
            <>
              <Field
                label="Sicherheitscode Zulassungsbescheinigung Teil I"
                htmlFor="ik-code1"
                hint="Wird bei Umschreibung und Halterwechsel benötigt."
                error={errors["ikfz.sicherheitscodeZb1"]}
              >
                <input
                  id="ik-code1"
                  maxLength={12}
                  value={value.sicherheitscodeZb1}
                  onChange={(e) =>
                    onChange({
                      sicherheitscodeZb1: e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, ""),
                    })
                  }
                  className={`${inputClass} font-mono uppercase tracking-widest`}
                />
              </Field>

              <Field
                label="Teil I ausgestellt am"
                htmlFor="ik-datum1"
                hint="Nur Papiere ab dem 01.01.2015 tragen einen Sicherheitscode."
                error={errors["ikfz.zb1AusgestelltAm"]}
              >
                <input
                  id="ik-datum1"
                  type="date"
                  value={value.zb1AusgestelltAm}
                  onChange={(e) => onChange({ zb1AusgestelltAm: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </>
          ) : null}
        </div>
      </fieldset>

      {/* Identifizierung */}
      <fieldset className="mb-9">
        <legend className="mb-1 text-sm font-semibold text-ink">
          Identifizierung
        </legend>
        <p className="mb-5 text-xs leading-relaxed text-ink-2">
          Das Verfahren verlangt eine sichere Identifizierung der Halterin bzw.
          des Halters. Den Link dazu erhalten Sie direkt nach der Bestellung.
        </p>

        <div className="grid gap-3">
          {identOptionen
            .filter((o) => (istFirma ? true : o.id !== "elster"))
            .map((o) => (
              <label
                key={o.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                  value.identVerfahren === o.id
                    ? "border-accent bg-accent-veil"
                    : "border-line hover:border-accent"
                }`}
              >
                <input
                  type="radio"
                  name="identVerfahren"
                  checked={value.identVerfahren === o.id}
                  onChange={() => onChange({ identVerfahren: o.id })}
                  className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{o.titel}</span>
                  <span className="block text-xs leading-relaxed text-ink-2">{o.text}</span>
                </span>
              </label>
            ))}
        </div>
        {errors["ikfz.identVerfahren"] ? (
          <p className="mt-2 text-xs font-medium text-risk">
            {errors["ikfz.identVerfahren"]}
          </p>
        ) : null}
      </fieldset>

      {/* Schilder */}
      <fieldset className="mb-9">
        <legend className="mb-1 text-sm font-semibold text-ink">
          Kennzeichenschilder
        </legend>
        <p className="mb-5 text-xs leading-relaxed text-ink-2">
          Der vorläufige Zulassungsnachweis erlaubt das Fahren nur mit
          montierten Schildern. Sie dürfen in den ersten{" "}
          {NACHWEIS_GUELTIGKEIT_TAGE} Tagen noch ungesiegelt sein.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              id: "express" as const,
              titel: "Express vorab liefern",
              text: "Wir prägen sofort nach der Reservierung und liefern per Express. Der Zulassungsantrag geht erst raus, wenn die Zustellung bestätigt ist.",
            },
            {
              id: "vorhanden" as const,
              titel: "Schilder sind schon da",
              text: "Bei Kennzeichenmitnahme oder wenn Sie die Schilder selbst besorgt haben. Wir reichen den Antrag sofort ein.",
            },
          ].map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                value.schilderWeg === o.id
                  ? "border-accent bg-accent-veil"
                  : "border-line hover:border-accent"
              }`}
            >
              <input
                type="radio"
                name="schilderWeg"
                checked={value.schilderWeg === o.id}
                onChange={() => onChange({ schilderWeg: o.id })}
                className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-ink">{o.titel}</span>
                <span className="block text-xs leading-relaxed text-ink-2">{o.text}</span>
              </span>
            </label>
          ))}
        </div>
        {errors["ikfz.schilderWeg"] ? (
          <p className="mt-2 text-xs font-medium text-risk">{errors["ikfz.schilderWeg"]}</p>
        ) : null}
      </fieldset>

      {/* Live-Vorprüfung */}
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-6">
        <h3 className="text-base font-semibold text-ink">Vorprüfung</h3>
        <p className="mt-1 text-xs text-ink-2">
          Aktualisiert sich mit Ihren Eingaben. Alle Punkte müssen erfüllt sein,
          damit die Behörde automatisiert entscheiden kann.
        </p>

        <ul className="mt-5 space-y-3">
          {pruefung.punkte.map((punkt) => (
            <li key={punkt.key} className="flex gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                  punkt.status === "erfuellt"
                    ? "bg-ok-veil text-ok"
                    : punkt.status === "ausgeschlossen"
                      ? "bg-risk-veil text-risk"
                      : "bg-warn-veil text-warn"
                }`}
              >
                {punkt.status === "erfuellt" ? "✓" : punkt.status === "ausgeschlossen" ? "×" : "!"}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">{punkt.label}</span>
                <span className="block text-xs leading-relaxed text-ink-2">{punkt.hinweis}</span>
              </span>
            </li>
          ))}
        </ul>

        {pruefung.moeglich ? (
          <p className="mt-5 flex items-center gap-2 rounded-lg bg-ok-veil px-4 py-3 text-sm font-semibold text-ok">
            <Check className="h-4 w-4" />
            Sofortzulassung ist für diesen Vorgang möglich.
          </p>
        ) : pruefung.ausschluesse.length > 0 ? (
          <p className="mt-5 rounded-lg bg-risk-veil px-4 py-3 text-sm text-risk">
            <strong>Sofortzulassung nicht möglich.</strong> Wir wickeln den
            Vorgang stattdessen klassisch mit Vollmacht ab – ohne Aufpreis für
            die Sofortzulassung. Sie können die Option im ersten Schritt
            abwählen.
          </p>
        ) : null}
      </div>

      <div className="mt-8">
        <label htmlFor="ik-bestaetigung" className="flex cursor-pointer items-start gap-3 text-sm text-ink-2">
          <input
            id="ik-bestaetigung"
            type="checkbox"
            checked={value.bestaetigung}
            onChange={(e) => onChange({ bestaetigung: e.target.checked })}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <span className="leading-relaxed">
            Mir ist bekannt, dass ich erst losfahren darf, wenn die
            Kennzeichenschilder montiert sind und der ausgedruckte vorläufige
            Zulassungsnachweis sichtbar im Fahrzeug liegt. Nach Erhalt der
            Plaketten bringe ich diese unverzüglich an.
          </span>
        </label>
        {errors["ikfz.bestaetigung"] ? (
          <p className="mt-1.5 pl-8 text-xs font-medium text-risk">
            {errors["ikfz.bestaetigung"]}
          </p>
        ) : null}
      </div>
    </section>
  );
}
