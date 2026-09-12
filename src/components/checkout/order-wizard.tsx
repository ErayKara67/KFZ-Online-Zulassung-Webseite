"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { services, getService, formatPrice, type ServiceSlug } from "@/lib/services";
import {
  documentsSchema,
  ikfzSchema,
  istSofortFaehig,
  sofortzulassungOption,
  extras as extraOptions,
  holderSchema,
  insuranceSchema,
  legalSchema,
  plateSchema,
  plateSizes,
  sepaSchema,
  shippingOptions,
  vehicleSchema,
} from "@/lib/order";
import { districts } from "@/lib/districts";
import { IkfzStep, type IkfzDraft } from "./ikfz-step";
import { VOLLMACHT_TEXT, VOLLMACHT_VERSION } from "@/lib/ikfz/vollmacht-text";
import { Button, Field, inputClass, Check } from "../ui";
import { LicensePlate } from "../license-plate";
import { OrderSummary } from "./order-summary";
import { leseJson } from "@/lib/antwort";

/* ------------------------------------------------------------------ Typen */

type Draft = {
  service: ServiceSlug;
  plate: { district: string; letters: string; numbers: string };
  plateSize: string;
  extras: string[];
  vehicle: {
    vin: string;
    zbTeil2: string;
    make: string;
    model: string;
    firstRegistration: string;
    huUntil: string;
    previousPlate: string;
  };
  holder: {
    salutation: "frau" | "herr" | "divers" | "firma";
    company: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    street: string;
    zip: string;
    city: string;
    email: string;
    phone: string;
  };
  insurance: { evb: string; insurer: string };
  sepa: { accountHolder: string; iban: string; mandate: boolean };
  documents: { powerOfAttorney: boolean; signature: string };
  shipping: {
    method: string;
    differentAddress: boolean;
    street: string;
    zip: string;
    city: string;
  };
  legal: { terms: boolean; privacy: boolean };
  sofortzulassung: boolean;
  ikfz: IkfzDraft;
  note: string;
};

type Errors = Record<string, string>;

const emptyDraft: Draft = {
  service: "wunschkennzeichen",
  plate: { district: "", letters: "", numbers: "" },
  plateSize: "standard",
  extras: [],
  vehicle: {
    vin: "",
    zbTeil2: "",
    make: "",
    model: "",
    firstRegistration: "",
    huUntil: "",
    previousPlate: "",
  },
  holder: {
    salutation: "frau",
    company: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    street: "",
    zip: "",
    city: "",
    email: "",
    phone: "",
  },
  insurance: { evb: "", insurer: "" },
  sepa: { accountHolder: "", iban: "", mandate: false },
  documents: { powerOfAttorney: false, signature: "" },
  shipping: { method: "standard", differentAddress: false, street: "", zip: "", city: "" },
  legal: { terms: false, privacy: false },
  sofortzulassung: false,
  ikfz: {
    sicherheitscodeZb2: "",
    sicherheitscodeZb1: "",
    zb2AusgestelltAm: "",
    zb1AusgestelltAm: "",
    identVerfahren: "eid",
    schilderWeg: "express",
    bestaetigung: false,
  },
  note: "",
};

const STORAGE_KEY = "kfz-portal:auftrag";

/* -------------------------------------------------------------- Hilfsteile */

function collect(error: z.ZodError, prefix: string): Errors {
  const out: Errors = {};
  for (const issue of error.issues) {
    const key = `${prefix}.${issue.path.join(".")}`;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function StepHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">{text}</p>
    </div>
  );
}

function CheckboxRow({
  id,
  checked,
  onChange,
  label,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      {/*
        py-2 mit ausgleichendem -my-2: Die Trefferfläche wächst oben und unten
        um acht Pixel, das Schriftbild bleibt unverändert. Bei einzeiligen
        Beschriftungen wäre die Zeile sonst nur gut zwanzig Pixel hoch – zu
        wenig, um sie mit dem Daumen sicher zu treffen.
      */}
      <label
        htmlFor={id}
        className="-my-2 flex cursor-pointer items-start gap-3 py-2 text-sm text-ink-2"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-[var(--color-accent)]"
        />
        <span className="leading-relaxed">{label}</span>
      </label>
      {error ? <p className="mt-1.5 pl-8 text-xs font-medium text-risk">{error}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ Wizard */

export function OrderWizard() {
  const params = useSearchParams();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  /* Vorbelegung aus URL + gespeichertem Entwurf */
  useEffect(() => {
    let base = emptyDraft;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) base = { ...emptyDraft, ...(JSON.parse(saved) as Draft) };
    } catch {
      /* Entwurf ignorieren */
    }

    const slug = params.get("leistung");
    const service = services.find((s) => s.slug === slug)?.slug ?? base.service;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- einmalige Initialisierung aus URL und gespeichertem Entwurf
    setDraft({
      ...base,
      service,
      sofortzulassung:
        params.get("sofort") === "1" ? true : base.sofortzulassung,
      plate: {
        district: (params.get("bezirk") ?? base.plate.district).toUpperCase(),
        letters: (params.get("buchstaben") ?? base.plate.letters).toUpperCase(),
        numbers: params.get("zahlen") ?? base.plate.numbers,
      },
    });
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* Speicher nicht verfügbar */
    }
  }, [draft, restored]);

  const service = getService(draft.service)!;
  const sections = service.sections;
  const sofortMoeglich = istSofortFaehig(draft.service);
  const sofortAktiv = sofortMoeglich && draft.sofortzulassung;
  const ikfzVorgang: "neuzulassung" | "umschreibung" =
    draft.service === "kfz-ummeldung" ? "umschreibung" : "neuzulassung";

  const stepList = useMemo(() => {
    const list: { id: string; label: string }[] = [
      { id: "leistung", label: "Leistung" },
    ];
    if (sections.includes("vehicle")) list.push({ id: "fahrzeug", label: "Fahrzeug" });
    list.push({ id: "halter", label: "Halter" });
    if (sofortAktiv) list.push({ id: "sofort", label: "Sofortzulassung" });
    if (sections.includes("documents")) {
      list.push({ id: "unterlagen", label: sofortAktiv ? "Vollmacht" : "Unterlagen" });
    }
    list.push({ id: "uebersicht", label: "Prüfen & zahlen" });
    return list;
  }, [sections, sofortAktiv]);

  const current = stepList[Math.min(step, stepList.length - 1)];

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const patch = <K extends keyof Draft>(key: K, value: Partial<Draft[K]>) =>
    setDraft((d) => ({ ...d, [key]: { ...(d[key] as object), ...value } as Draft[K] }));

  const requiredUploads = useMemo(() => {
    const list: { id: string; label: string; hint: string }[] = [];
    // Bei der Sofortzulassung ersetzt die elektronische Identifizierung die
    // Ausweiskopie, und die Fahrzeugdaten kommen über die Sicherheitscodes
    // aus dem Register – es sind keine Uploads nötig.
    if (sofortAktiv) return list;
    if (sections.includes("documents")) {
      list.push({
        id: "ausweis",
        label: "Ausweisdokument des Halters",
        hint: "Personalausweis (Vorder- und Rückseite) oder Reisepass mit Meldebescheinigung.",
      });
      if (draft.service === "kfz-zulassung" || draft.service === "kfz-ummeldung") {
        list.push({
          id: "zb2",
          label: "Zulassungsbescheinigung Teil II",
          hint: "Früher „Fahrzeugbrief“. Bitte vollständig abfotografieren oder scannen.",
        });
      }
      if (draft.service !== "kfz-zulassung") {
        list.push({
          id: "zb1",
          label: "Zulassungsbescheinigung Teil I",
          hint: "Früher „Fahrzeugschein“.",
        });
      }
    }
    return list;
  }, [sections, draft.service, sofortAktiv]);

  function validateStep(id: string): Errors {
    let out: Errors = {};
    if (id === "leistung" && sections.includes("plate")) {
      const r = plateSchema.safeParse({ ...draft.plate, size: draft.plateSize });
      if (!r.success) out = { ...out, ...collect(r.error, "plate") };
    }
    if (id === "fahrzeug") {
      const r = vehicleSchema.safeParse(draft.vehicle);
      if (!r.success) out = { ...out, ...collect(r.error, "vehicle") };
    }
    if (id === "halter") {
      const r = holderSchema.safeParse(draft.holder);
      if (!r.success) out = { ...out, ...collect(r.error, "holder") };
      if (draft.holder.salutation === "firma" && !draft.holder.company.trim()) {
        out["holder.company"] = "Bitte Firmennamen angeben";
      }
      if (sections.includes("insurance")) {
        const ri = insuranceSchema.safeParse(draft.insurance);
        if (!ri.success) out = { ...out, ...collect(ri.error, "insurance") };
      }
      if (sections.includes("sepa")) {
        const rs = sepaSchema.safeParse(draft.sepa);
        if (!rs.success) out = { ...out, ...collect(rs.error, "sepa") };
      }
    }
    if (id === "sofort") {
      const r = ikfzSchema.safeParse({
        ...draft.ikfz,
        sicherheitscodeZb1: draft.ikfz.sicherheitscodeZb1 || undefined,
        zb1AusgestelltAm: draft.ikfz.zb1AusgestelltAm || undefined,
      });
      if (!r.success) out = { ...out, ...collect(r.error, "ikfz") };
      if (ikfzVorgang === "umschreibung" && !draft.ikfz.sicherheitscodeZb1) {
        out["ikfz.sicherheitscodeZb1"] =
          "Bei einer Umschreibung wird auch der Sicherheitscode von Teil I benötigt";
      }
    }
    if (id === "unterlagen") {
      const r = documentsSchema.safeParse(draft.documents);
      if (!r.success) out = { ...out, ...collect(r.error, "documents") };
      for (const doc of requiredUploads) {
        if (!files[doc.id]) out[`file.${doc.id}`] = `Bitte ${doc.label} hochladen`;
      }
    }
    if (id === "uebersicht") {
      const r = legalSchema.safeParse(draft.legal);
      if (!r.success) out = { ...out, ...collect(r.error, "legal") };
    }
    return out;
  }


  /**
   * Springt zum ersten beanstandeten Feld und setzt den Schreibcursor hinein.
   *
   * Die Reihenfolge kommt aus dem Dokument, nicht aus der Fehlerliste: Welches
   * Feld zuerst geprüft wurde, muss nicht das oberste auf dem Bildschirm sein.
   * Der Aufruf wartet einen Bilddurchlauf ab, weil die Markierungen erst nach
   * dem nächsten Zeichnen im Dokument stehen.
   */
  function zumErstenFehler() {
    requestAnimationFrame(() => {
      const markiert = [...document.querySelectorAll<HTMLElement>("[data-fehlerfeld]")];
      const ziel = markiert
        .map((el) => document.getElementById(el.dataset.fehlerfeld ?? ""))
        .find((el): el is HTMLElement => el !== null);

      if (!ziel) {
        document.getElementById("wizard-top")?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      ziel.scrollIntoView({ behavior: "smooth", block: "center" });
      /* preventScroll: der Sprung oben soll nicht doppelt ausgelöst werden */
      ziel.focus({ preventScroll: true });
    });
  }

  function next() {
    const found = validateStep(current.id);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      zumErstenFehler();
      return;
    }
    setStep((s) => Math.min(s + 1, stepList.length - 1));
    document.getElementById("wizard-top")?.scrollIntoView({ behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    document.getElementById("wizard-top")?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit() {
    const found = validateStep("uebersicht");
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const form = new FormData();
      /* Vom Autohaus vorbereiteter Vorgang – wird fortgeschrieben */
      const vorbereitet = params.get("auftrag");
      const vorbereiteterCode = params.get("code");
      if (vorbereitet && vorbereiteterCode) {
        form.append("auftrag", vorbereitet);
        form.append("code", vorbereiteterCode);
      }
      form.append(
        "payload",
        JSON.stringify({
          service: draft.service,
          plate: sections.includes("plate") ? draft.plate : undefined,
          vehicle: sections.includes("vehicle") ? draft.vehicle : undefined,
          holder: draft.holder,
          insurance: sections.includes("insurance") ? draft.insurance : undefined,
          sepa: sections.includes("sepa") ? draft.sepa : undefined,
          documents: sections.includes("documents") ? draft.documents : undefined,
          ikfz: sofortAktiv ? draft.ikfz : undefined,
          sofortzulassung: sofortAktiv,
          shipping: sections.includes("shipping") ? draft.shipping : undefined,
          extras: draft.extras,
          plateSize: draft.plateSize,
          shippingMethod: draft.shipping.method,
          legal: draft.legal,
          note: draft.note,
        }),
      );
      for (const [key, file] of Object.entries(files)) {
        if (file) form.append(`datei_${key}`, file, file.name);
      }

      const orderRes = await fetch("/api/bestellung", { method: "POST", body: form });
      const { ok: orderOk, daten: orderData, fehler: orderFehler } = await leseJson<{
        orderId: string;
      }>(orderRes);
      if (!orderOk || !orderData) {
        throw new Error(orderFehler ?? "Auftrag konnte nicht angelegt werden.");
      }

      const payRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId }),
      });
      const { ok: payOk, daten: payData, fehler: payFehler } = await leseJson<{
        url: string;
      }>(payRes);
      if (!payOk || !payData?.url) {
        throw new Error(payFehler ?? "Die Zahlung konnte nicht gestartet werden.");
      }

      sessionStorage.removeItem(STORAGE_KEY);
      window.location.assign(payData.url);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Unbekannter Fehler bei der Übermittlung.",
      );
      setSubmitting(false);
    }
  }

  const selection = {
    service: draft.service,
    plateSize: draft.plateSize,
    extras: draft.extras,
    shipping: draft.shipping.method,
    sofortzulassung: sofortAktiv,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div id="wizard-top" className="scroll-mt-28">
        {/*
          Fortschritt, zweifach.

          Auf dem Handy passt die Schrittleiste nicht in eine Zeile; umgebrochen
          nimmt sie zwei Zeilen ein und drängt den eigentlichen Inhalt nach
          unten, ohne mehr zu sagen als „wo bin ich, wie viel fehlt". Genau das
          steht kompakt darüber — ab Tablettbreite wieder die volle Leiste.
        */}
        <div className="mb-7 sm:hidden">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-ink">{current.label}</p>
            <p className="text-xs text-ink-3 tnum">
              Schritt {step + 1} von {stepList.length}
            </p>
          </div>
          <div
            className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-card"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={stepList.length}
            aria-label={`Schritt ${step + 1} von ${stepList.length}: ${current.label}`}
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${((step + 1) / stepList.length) * 100}%` }}
            />
          </div>
        </div>

        <ol className="mb-9 hidden flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:flex">
          {stepList.map((s, i) => {
            const state = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <li key={s.id} className="flex items-center gap-3">
                <span
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-medium ${
                    state === "current"
                      ? "bg-accent text-[var(--color-on-accent)]"
                      : state === "done"
                        ? "bg-ok-veil text-ok"
                        : "bg-card text-ink-2"
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-card/25 text-xs">
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  {s.label}
                </span>
                {i < stepList.length - 1 ? (
                  <span aria-hidden="true" className="hidden h-px w-6 bg-line sm:block" />
                ) : null}
              </li>
            );
          })}
        </ol>

        {Object.keys(errors).length > 0 ? (
          <div role="alert" className="mb-7 rounded-lg border border-risk/25 bg-risk-veil p-4">
            <p className="text-sm font-semibold text-risk">
              Bitte prüfen Sie die markierten Felder
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-risk">
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>{message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ------------------------------------------------ Schritt: Leistung */}
        {current.id === "leistung" ? (
          <section>
            <StepHeader
              title="Leistung und Kennzeichen"
              text="Wählen Sie den Vorgang aus und legen Sie fest, welches Kennzeichen wir für Sie sichern sollen."
            />

            <fieldset className="mb-8">
              <legend className="mb-3 text-sm font-semibold text-ink">Vorgang</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <label
                    key={s.slug}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                      draft.service === s.slug
                        ? "border-accent bg-accent-veil"
                        : "border-line hover:border-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={s.slug}
                      checked={draft.service === s.slug}
                      onChange={() => {
                        set("service", s.slug);
                        setStep(0);
                      }}
                      className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{s.title}</span>
                      <span className="block text-xs text-ink-2">{s.short}</span>
                      <span className="mt-1 block text-sm font-semibold text-accent-bright">
                        {formatPrice(s.price)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {sofortMoeglich ? (
              <div
                className={`mb-8 rounded-[var(--radius-card)] border-2 p-6 transition-colors ${
                  draft.sofortzulassung ? "border-accent bg-accent-veil" : "border-line bg-card"
                }`}
              >
                <label htmlFor="sofort-toggle" className="flex cursor-pointer items-start gap-3">
                  <input
                    id="sofort-toggle"
                    type="checkbox"
                    checked={draft.sofortzulassung}
                    onChange={(e) => set("sofortzulassung", e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-ink">
                        {sofortzulassungOption.label}
                      </span>
                      <span className="rounded-full bg-ok-veil px-2.5 py-1 text-xs font-semibold text-ok">
                        Sofort losfahren
                      </span>
                      <span className="text-sm font-semibold text-accent-bright">
                        + {formatPrice(sofortzulassungOption.price)}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-ink-2">
                      Statt auf Papiere zu warten: Wir liefern die Schilder vorab
                      per Express und reichen den Antrag digital ein. Sie erhalten
                      den vorläufigen Zulassungsnachweis und dürfen bis zu 14 Tage
                      fahren, während Zulassungsbescheinigung und Plaketten per
                      Post kommen.
                    </span>
                    <span className="mt-3 block text-xs leading-relaxed text-ink-2">
                      Voraussetzungen: Fahrzeugpapiere mit Sicherheitscode,
                      gültige Hauptuntersuchung, eVB-Nummer, SEPA-Mandat und eine
                      elektronische Identifizierung. Wir prüfen das im Verlauf
                      Schritt für Schritt.
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {sections.includes("plate") ? (
              <>
                <fieldset className="mb-8">
                  <legend className="mb-3 text-sm font-semibold text-ink">
                    Ihr Wunschkennzeichen
                  </legend>
                  <div className="grid grid-cols-3 gap-3 sm:max-w-md">
                    <Field label="Ort" htmlFor="w-district" required error={errors["plate.district"]}>
                      <input
                        id="w-district"
                        autoComplete="off"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        list="w-districts"
                        maxLength={3}
                        value={draft.plate.district}
                        onChange={(e) =>
                          patch("plate", {
                            district: e.target.value.toUpperCase().replace(/[^A-ZÄÖÜ]/g, ""),
                          })
                        }
                        className={`${inputClass} text-center text-lg font-bold uppercase`}
                      />
                      <datalist id="w-districts">
                        {districts.slice(0, 400).map((d) => (
                          <option key={`${d.code}-${d.city}`} value={d.code}>
                            {d.city}
                          </option>
                        ))}
                      </datalist>
                    </Field>
                    <Field label="Buchst." htmlFor="w-letters" required error={errors["plate.letters"]}>
                      <input
                        id="w-letters"
                        autoComplete="off"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={2}
                        value={draft.plate.letters}
                        onChange={(e) =>
                          patch("plate", {
                            letters: e.target.value.toUpperCase().replace(/[^A-ZÄÖÜ]/g, ""),
                          })
                        }
                        className={`${inputClass} text-center text-lg font-bold uppercase`}
                      />
                    </Field>
                    <Field label="Zahlen" htmlFor="w-numbers" required error={errors["plate.numbers"]}>
                      <input
                        id="w-numbers"
                        autoComplete="off"
                        maxLength={4}
                        inputMode="numeric"
                        value={draft.plate.numbers}
                        onChange={(e) =>
                          patch("plate", { numbers: e.target.value.replace(/[^0-9]/g, "") })
                        }
                        className={`${inputClass} text-center text-lg font-bold`}
                      />
                    </Field>
                  </div>

                  <div className="mt-5">
                    <LicensePlate
                      district={draft.plate.district}
                      letters={draft.plate.letters}
                      numbers={draft.plate.numbers}
                    />
                  </div>
                </fieldset>

                <fieldset className="mb-8">
                  <legend className="mb-3 text-sm font-semibold text-ink">Schildergröße</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {plateSizes.map((size) => (
                      <label
                        key={size.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                          draft.plateSize === size.id
                            ? "border-accent bg-accent-veil"
                            : "border-line hover:border-accent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="plateSize"
                          checked={draft.plateSize === size.id}
                          onChange={() => set("plateSize", size.id)}
                          className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                        />
                        <span>
                          <span className="block text-sm font-medium text-ink">{size.label}</span>
                          <span className="block text-xs text-ink-2">{size.description}</span>
                          <span className="mt-1 block text-xs font-semibold text-accent-bright">
                            {size.price === 0 ? "inklusive" : `+ ${formatPrice(size.price)}`}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}

            <fieldset className="mb-8">
              <legend className="mb-3 text-sm font-semibold text-ink">
                Zusatzleistungen (optional)
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {extraOptions.map((extra) => {
                  const active = draft.extras.includes(extra.id);
                  return (
                    <label
                      key={extra.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                        active ? "border-accent bg-accent-veil" : "border-line hover:border-accent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) =>
                          set(
                            "extras",
                            e.target.checked
                              ? [...draft.extras, extra.id]
                              : draft.extras.filter((x) => x !== extra.id),
                          )
                        }
                        className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-ink">{extra.label}</span>
                        <span className="block text-xs text-ink-2">{extra.description}</span>
                        <span className="mt-1 block text-xs font-semibold text-accent-bright">
                          + {formatPrice(extra.price)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </section>
        ) : null}

        {/* ------------------------------------------------ Schritt: Fahrzeug */}
        {current.id === "fahrzeug" ? (
          <section>
            <StepHeader
              title="Fahrzeugdaten"
              text="Die Angaben finden Sie in der Zulassungsbescheinigung. Wir gleichen sie vor der Einreichung mit Ihren Unterlagen ab."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Fahrzeug-Identifizierungsnummer (FIN)"
                htmlFor="v-vin"
                required
                hint="Die 17-stellige Fahrgestellnummer. Sie steht im Fahrzeugschein im Feld E und ist außerdem im Motorraum oder am Türholm eingeprägt."
                error={errors["vehicle.vin"]}
                className="sm:col-span-2"
              >
                <input
                  id="v-vin"
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={17}
                  value={draft.vehicle.vin}
                  onChange={(e) => patch("vehicle", { vin: e.target.value.toUpperCase() })}
                  className={`${inputClass} font-mono uppercase tracking-wider`}
                />
              </Field>

              <Field
                label="Nummer der Zulassungsbescheinigung Teil II"
                htmlFor="v-zb2"
                required
                hint="Teil II ist der frühere Fahrzeugbrief — das Dokument, das zu Hause bleibt. Die Nummer steht dort neben dem grünen Rubbelfeld und zusätzlich oben auf dem Fahrzeugschein."
                error={errors["vehicle.zbTeil2"]}
              >
                <input
                  id="v-zb2"
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  value={draft.vehicle.zbTeil2}
                  onChange={(e) => patch("vehicle", { zbTeil2: e.target.value.toUpperCase() })}
                  className={`${inputClass} font-mono uppercase`}
                />
              </Field>

              <Field label="Bisheriges Kennzeichen" htmlFor="v-prev" hint="Nur bei Gebrauchtfahrzeugen — das Kennzeichen, mit dem das Auto bisher gefahren ist.">
                <input
                  id="v-prev"
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  value={draft.vehicle.previousPlate}
                  onChange={(e) => patch("vehicle", { previousPlate: e.target.value.toUpperCase() })}
                  className={`${inputClass} uppercase`}
                />
              </Field>

              <Field label="Hersteller" htmlFor="v-make" required error={errors["vehicle.make"]}>
                <input
                  id="v-make"
                  autoComplete="off"
                  autoCapitalize="words"
                  value={draft.vehicle.make}
                  onChange={(e) => patch("vehicle", { make: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Modell" htmlFor="v-model" required error={errors["vehicle.model"]}>
                <input
                  id="v-model"
                  autoComplete="off"
                  autoCapitalize="words"
                  value={draft.vehicle.model}
                  onChange={(e) => patch("vehicle", { model: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Erstzulassung" htmlFor="v-first" hint="Der Tag, an dem das Fahrzeug zum ersten Mal angemeldet wurde. Im Fahrzeugschein Feld B.">
                <input
                  id="v-first"
                  type="date"
                  value={draft.vehicle.firstRegistration}
                  onChange={(e) => patch("vehicle", { firstRegistration: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Hauptuntersuchung gültig bis" htmlFor="v-hu" hint="Umgangssprachlich der TÜV. Monat und Jahr stehen auf der runden Plakette am hinteren Kennzeichen.">
                <input
                  id="v-hu"
                  type="month"
                  value={draft.vehicle.huUntil}
                  onChange={(e) => patch("vehicle", { huUntil: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>
        ) : null}

        {/* -------------------------------------------------- Schritt: Halter */}
        {current.id === "halter" ? (
          <section className="space-y-10">
            <div>
              <StepHeader
                title="Halterdaten"
                text="Die Angaben müssen mit dem Ausweisdokument übereinstimmen, das Sie im nächsten Schritt hochladen."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Anrede" htmlFor="h-salutation" required>
                  <select
                    id="h-salutation"
                    value={draft.holder.salutation}
                    onChange={(e) =>
                      patch("holder", { salutation: e.target.value as Draft["holder"]["salutation"] })
                    }
                    className={inputClass}
                  >
                    <option value="frau">Frau</option>
                    <option value="herr">Herr</option>
                    <option value="divers">Keine Angabe</option>
                    <option value="firma">Firma</option>
                  </select>
                </Field>

                {draft.holder.salutation === "firma" ? (
                  <Field label="Firmenname" htmlFor="h-company" required error={errors["holder.company"]}>
                    <input
                      id="h-company"
                      value={draft.holder.company}
                      onChange={(e) => patch("holder", { company: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                ) : (
                  <div className="hidden sm:block" />
                )}

                <Field label="Vorname" htmlFor="h-first" required error={errors["holder.firstName"]}>
                  <input
                    id="h-first"
                    autoComplete="given-name"
                    value={draft.holder.firstName}
                    onChange={(e) => patch("holder", { firstName: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Nachname" htmlFor="h-last" required error={errors["holder.lastName"]}>
                  <input
                    id="h-last"
                    autoComplete="family-name"
                    value={draft.holder.lastName}
                    onChange={(e) => patch("holder", { lastName: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Geburtsdatum" htmlFor="h-birth">
                  <input
                    id="h-birth"
                    type="date"
                    value={draft.holder.birthDate}
                    onChange={(e) => patch("holder", { birthDate: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Geburtsort" htmlFor="h-birthplace" hint="Nur nötig, wenn die Behörde rückfragt.">
                  <input
                    id="h-birthplace"
                    autoComplete="off"
                    autoCapitalize="words"
                    value={draft.holder.birthPlace}
                    onChange={(e) => patch("holder", { birthPlace: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Straße und Hausnummer"
                  htmlFor="h-street"
                  required
                  error={errors["holder.street"]}
                  className="sm:col-span-2"
                >
                  <input
                    id="h-street"
                    autoComplete="street-address"
                    value={draft.holder.street}
                    onChange={(e) => patch("holder", { street: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="PLZ" htmlFor="h-zip" required error={errors["holder.zip"]}>
                  <input
                    id="h-zip"
                    inputMode="numeric"
                    maxLength={5}
                    autoComplete="postal-code"
                    value={draft.holder.zip}
                    onChange={(e) => patch("holder", { zip: e.target.value.replace(/[^0-9]/g, "") })}
                    className={inputClass}
                  />
                </Field>

                <Field label="Ort" htmlFor="h-city" required error={errors["holder.city"]}>
                  <input
                    id="h-city"
                    autoComplete="address-level2"
                    value={draft.holder.city}
                    onChange={(e) => patch("holder", { city: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field label="E-Mail" htmlFor="h-email" required error={errors["holder.email"]}>
                  <input
                    id="h-email"
                    type="email"
                    autoComplete="email"
                    value={draft.holder.email}
                    onChange={(e) => patch("holder", { email: e.target.value })}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Telefon"
                  htmlFor="h-phone"
                  required
                  hint="Nur für Rückfragen zum Vorgang."
                  error={errors["holder.phone"]}
                >
                  <input
                    id="h-phone"
                    type="tel"
                    autoComplete="tel"
                    value={draft.holder.phone}
                    onChange={(e) => patch("holder", { phone: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            {sections.includes("insurance") ? (
              <div>
                <h3 className="text-lg font-semibold text-ink">Versicherung</h3>
                <p className="mt-1.5 text-sm text-ink-2">
                  Die eVB-Nummer erhalten Sie von Ihrer Kfz-Versicherung – ohne sie
                  ist keine Zulassung möglich.
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="eVB-Nummer"
                    htmlFor="i-evb"
                    required
                    hint="Sieben Zeichen aus Buchstaben und Ziffern. Sie bekommen die Nummer kostenlos von Ihrer Kfz-Versicherung, meist binnen Minuten per E-Mail oder SMS."
                    error={errors["insurance.evb"]}
                  >
                    <input
                      id="i-evb"
                      autoComplete="off"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      maxLength={7}
                      value={draft.insurance.evb}
                      onChange={(e) => patch("insurance", { evb: e.target.value.toUpperCase() })}
                      className={`${inputClass} font-mono uppercase tracking-widest`}
                    />
                  </Field>
                  <Field label="Versicherungsgesellschaft" htmlFor="i-insurer" hint="Freiwillig. Hilft uns bei Rückfragen.">
                    <input
                      id="i-insurer"
                      autoComplete="off"
                      autoCapitalize="words"
                      value={draft.insurance.insurer}
                      onChange={(e) => patch("insurance", { insurer: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            ) : null}

            {sections.includes("sepa") ? (
              <div>
                <h3 className="text-lg font-semibold text-ink">
                  SEPA-Mandat für die Kfz-Steuer
                </h3>
                <p className="mt-1.5 text-sm text-ink-2">
                  Die Kfz-Steuer wird vom Hauptzollamt eingezogen. Ein gültiges
                  SEPA-Mandat ist gesetzlich Voraussetzung für die Zulassung.
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Kontoinhaber"
                    htmlFor="s-holder"
                    required
                    error={errors["sepa.accountHolder"]}
                  >
                    <input
                      id="s-holder"
                      autoComplete="name"
                      autoCapitalize="words"
                      value={draft.sepa.accountHolder}
                      onChange={(e) => patch("sepa", { accountHolder: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="IBAN"
                    htmlFor="s-iban"
                    required
                    hint="Für die Kfz-Steuer. Wir speichern die IBAN nur unkenntlich gemacht — abgebucht wird ausschließlich vom Hauptzollamt, nicht von uns."
                    error={errors["sepa.iban"]}
                  >
                    <input
                      id="s-iban"
                      autoComplete="off"
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="text"
                      value={draft.sepa.iban}
                      onChange={(e) => patch("sepa", { iban: e.target.value.toUpperCase() })}
                      className={`${inputClass} font-mono uppercase`}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <CheckboxRow
                      id="s-mandate"
                      checked={draft.sepa.mandate}
                      onChange={(v) => patch("sepa", { mandate: v })}
                      error={errors["sepa.mandate"]}
                      label="Ich ermächtige das zuständige Hauptzollamt, die Kfz-Steuer von meinem Konto einzuziehen, und weise mein Kreditinstitut an, die Lastschriften einzulösen."
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {sections.includes("shipping") ? (
              <div>
                <h3 className="text-lg font-semibold text-ink">Versand</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                        draft.shipping.method === opt.id
                          ? "border-accent bg-accent-veil"
                          : "border-line hover:border-accent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={draft.shipping.method === opt.id}
                        onChange={() => patch("shipping", { method: opt.id })}
                        className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-ink">{opt.label}</span>
                        <span className="block text-xs text-ink-2">{opt.description}</span>
                        <span className="mt-1 block text-xs font-semibold text-accent-bright">
                          {opt.price === 0 ? "inklusive" : `+ ${formatPrice(opt.price)}`}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-5">
                  <CheckboxRow
                    id="ship-diff"
                    checked={draft.shipping.differentAddress}
                    onChange={(v) => patch("shipping", { differentAddress: v })}
                    label="Lieferung an eine abweichende Adresse"
                  />
                </div>

                {draft.shipping.differentAddress ? (
                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    <Field label="Straße und Hausnummer" htmlFor="sh-street" className="sm:col-span-3">
                      <input
                        id="sh-street"
                        autoComplete="shipping street-address"
                        value={draft.shipping.street}
                        onChange={(e) => patch("shipping", { street: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="PLZ" htmlFor="sh-zip">
                      <input
                        id="sh-zip"
                        inputMode="numeric"
                        autoComplete="shipping postal-code"
                        maxLength={5}
                        value={draft.shipping.zip}
                        onChange={(e) =>
                          patch("shipping", { zip: e.target.value.replace(/[^0-9]/g, "") })
                        }
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Ort" htmlFor="sh-city" className="sm:col-span-2">
                      <input
                        id="sh-city"
                        autoComplete="shipping address-level2"
                        autoCapitalize="words"
                        value={draft.shipping.city}
                        onChange={(e) => patch("shipping", { city: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* ------------------------------------------- Schritt: Sofortzulassung */}
        {current.id === "sofort" ? (
          <IkfzStep
            value={draft.ikfz}
            onChange={(änderung) => patch("ikfz", änderung)}
            errors={errors}
            vorgang={ikfzVorgang}
            istFirma={draft.holder.salutation === "firma"}
            evb={draft.insurance.evb}
            iban={draft.sepa.iban}
            huGueltigBis={draft.vehicle.huUntil}
          />
        ) : null}

        {/* ---------------------------------------------- Schritt: Unterlagen */}
        {current.id === "unterlagen" ? (
          <section>
            <StepHeader
              title={sofortAktiv ? "Vollmacht" : "Unterlagen und Vollmacht"}
              text={
                sofortAktiv
                  ? "Für die Sofortzulassung entfallen die Dokument-Uploads: Ihre Identität wird elektronisch nachgewiesen, die Fahrzeugdaten liest die Behörde über die Sicherheitscodes aus dem Register. Wir brauchen nur noch Ihre Vollmacht."
                  : "Laden Sie die Dokumente als Foto oder PDF hoch. Die Dateien werden verschlüsselt übertragen und nach Abschluss des Vorgangs gelöscht."
              }
            />

            {sofortAktiv ? (
              <p className="mb-6 flex items-start gap-2 rounded-lg bg-ok-veil px-4 py-3 text-sm text-ok">
                <Check className="mt-0.5 h-4 w-4 shrink-0" />
                Keine Ausweiskopie, kein Scan der Fahrzeugpapiere nötig.
              </p>
            ) : null}

            <div className="space-y-4">
              {requiredUploads.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-line p-5">
                  <label htmlFor={`file-${doc.id}`} className="block text-sm font-semibold text-ink">
                    {doc.label} <span className="text-risk">*</span>
                  </label>
                  <p className="mt-1 text-xs text-ink-2">{doc.hint}</p>
                  <input
                    id={`file-${doc.id}`}
                    type="file"
                    accept="image/jpeg,image/png,image/heic,application/pdf"
                    onChange={(e) =>
                      setFiles((f) => ({ ...f, [doc.id]: e.target.files?.[0] ?? null }))
                    }
                    className="mt-3 block w-full text-sm text-ink-2 file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-on-accent)] hover:file:bg-accent-bright"
                  />
                  {files[doc.id] ? (
                    <p className="mt-2 flex items-center gap-2 text-xs font-medium text-ok">
                      <Check className="h-4 w-4" />
                      {files[doc.id]?.name} ({Math.round((files[doc.id]?.size ?? 0) / 1024)} KB)
                    </p>
                  ) : null}
                  {errors[`file.${doc.id}`] ? (
                    <p className="mt-2 text-xs font-medium text-risk">
                      {errors[`file.${doc.id}`]}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-line bg-card p-6">
              <h3 className="text-base font-semibold text-ink">Vollmacht</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{VOLLMACHT_TEXT}</p>
              <p className="mt-2 text-xs text-ink-3">Fassung {VOLLMACHT_VERSION}</p>

              <div className="mt-5">
                <CheckboxRow
                  id="d-poa"
                  checked={draft.documents.powerOfAttorney}
                  onChange={(v) => patch("documents", { powerOfAttorney: v })}
                  error={errors["documents.powerOfAttorney"]}
                  label="Ich erteile die Vollmacht in der oben stehenden Fassung."
                />
              </div>

              {sofortAktiv ? (
                <p className="mt-5 rounded-lg border border-accent bg-accent-veil p-4 text-sm leading-relaxed text-accent-bright">
                  <strong>Signatur folgt im nächsten Schritt.</strong> Für den
                  Antrag bei der Zulassungsbehörde verlangt § 38 FZV eine
                  qualifizierte elektronische Signatur – bei Firmen ein
                  qualifiziertes elektronisches Siegel. Den Link dazu erhalten Sie
                  direkt nach der Bestellung; der Vorgang dauert wenige Minuten.
                </p>
              ) : null}

              <Field
                label="Name für die Vollmacht"
                htmlFor="d-sign"
                required
                hint={
                  sofortAktiv
                    ? "Vor- und Nachname wie im Ausweis. Er erscheint auf der Vollmacht, die Sie anschließend qualifiziert signieren."
                    : "Die getippte Unterschrift wird der Vollmacht beigefügt."
                }
                error={errors["documents.signature"]}
                className="mt-6 max-w-sm"
              >
                <input
                  id="d-sign"
                  value={draft.documents.signature}
                  onChange={(e) => patch("documents", { signature: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>
        ) : null}

        {/* ---------------------------------------------- Schritt: Übersicht */}
        {current.id === "uebersicht" ? (
          <section>
            <StepHeader
              title="Prüfen und bezahlen"
              text="Bitte kontrollieren Sie Ihre Angaben. Nach der Zahlung starten wir sofort mit der Bearbeitung."
            />

            <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
              <Row label="Leistung" value={service.title} />
              {sections.includes("plate") ? (
                <Row
                  label="Kennzeichen"
                  value={`${draft.plate.district}-${draft.plate.letters} ${draft.plate.numbers}`}
                />
              ) : null}
              {sections.includes("vehicle") ? (
                <Row
                  label="Fahrzeug"
                  value={`${draft.vehicle.make} ${draft.vehicle.model} · FIN ${draft.vehicle.vin}`}
                />
              ) : null}
              <Row
                label="Halter"
                value={`${draft.holder.firstName} ${draft.holder.lastName}, ${draft.holder.street}, ${draft.holder.zip} ${draft.holder.city}`}
              />
              <Row label="Kontakt" value={`${draft.holder.email} · ${draft.holder.phone}`} />
              {sections.includes("insurance") ? (
                <Row label="eVB-Nummer" value={draft.insurance.evb} />
              ) : null}
              {sofortAktiv ? (
                <>
                  <Row label="Verfahren" value="Sofortzulassung nach i-Kfz Stufe 4" />
                  <Row
                    label="Identifizierung"
                    value={
                      draft.ikfz.identVerfahren === "eid"
                        ? "Online-Ausweisfunktion (eID)"
                        : draft.ikfz.identVerfahren === "elster"
                          ? "ELSTER-Unternehmenskonto"
                          : "Vertrauensdiensteanbieter"
                    }
                  />
                  <Row
                    label="Kennzeichenschilder"
                    value={
                      draft.ikfz.schilderWeg === "express"
                        ? "Express-Vorabversand durch uns"
                        : "Beim Halter vorhanden"
                    }
                  />
                </>
              ) : null}
              {sections.includes("sepa") ? (
                <Row
                  label="SEPA-Mandat"
                  value={`${draft.sepa.accountHolder} · ${draft.sepa.iban.replace(
                    /^(.{4}).*(.{4})$/,
                    "$1 •••• •••• $2",
                  )}`}
                />
              ) : null}
            </dl>

            <Field
              label="Nachricht an unser Team (optional)"
              htmlFor="note"
              className="mt-8"
              hint="Zum Beispiel Wunschtermin, Besonderheiten am Fahrzeug oder abweichender Rechnungsempfänger."
            >
              <textarea
                id="note"
                rows={4}
                maxLength={2000}
                value={draft.note}
                onChange={(e) => set("note", e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="mt-8 space-y-4 rounded-lg border border-line bg-card p-6">
              <CheckboxRow
                id="l-terms"
                checked={draft.legal.terms}
                onChange={(v) => patch("legal", { terms: v })}
                error={errors["legal.terms"]}
                label={
                  <>
                    Ich habe die{" "}
                    <Link href="/agb" className="font-semibold text-accent-bright underline">
                      AGB
                    </Link>{" "}
                    und die{" "}
                    <Link href="/widerruf" className="font-semibold text-accent-bright underline">
                      Widerrufsbelehrung
                    </Link>{" "}
                    gelesen. Mir ist bekannt, dass mein Widerrufsrecht erlischt,
                    sobald der Vorgang bei der Behörde eingereicht ist.
                  </>
                }
              />
              <CheckboxRow
                id="l-privacy"
                checked={draft.legal.privacy}
                onChange={(v) => patch("legal", { privacy: v })}
                error={errors["legal.privacy"]}
                label={
                  <>
                    Ich willige in die Verarbeitung meiner Daten gemäß der{" "}
                    <Link href="/datenschutz" className="font-semibold text-accent-bright underline">
                      Datenschutzerklärung
                    </Link>{" "}
                    zum Zweck der Auftragsabwicklung ein.
                  </>
                }
              />
            </div>

            <div className="mt-8 rounded-lg border border-line p-6">
              <h3 className="text-base font-semibold text-ink">Zahlungsart</h3>
              <p className="mt-2 text-sm text-ink-2">
                Die Zahlung läuft über unseren Zahlungsdienstleister. Im nächsten
                Schritt wählen Sie zwischen Kreditkarte, PayPal, Klarna,
                SEPA-Lastschrift, Apple Pay und Google Pay.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {["Kreditkarte", "PayPal", "Klarna", "SEPA", "Apple Pay", "Google Pay"].map((p) => (
                  <li
                    key={p}
                    className="rounded-md border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink-2"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {submitError ? (
              <p role="alert" className="mt-6 rounded-lg bg-risk-veil px-4 py-3 text-sm font-medium text-risk">
                {submitError}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* ------------------------------------------------------ Navigation */}
        {/*
          Auf dem Handy bleibt die Navigation am unteren Rand stehen. Die
          Halterseite ist lang; ohne das müsste man nach jedem Ausfüllen erst
          ans Ende scrollen, um weiterzukommen. Ab Tablettbreite läuft die
          Leiste wieder normal mit, dort ist der Weg zum Knopf kurz genug.
        */}
        <div className="safe-bottom sticky bottom-0 z-30 mt-10 flex items-center justify-between gap-3 border-t border-line bg-ground/95 pt-3 pb-3 backdrop-blur sm:static sm:bg-transparent sm:pt-6 sm:pb-0 sm:backdrop-blur-none">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={back}>
              ← Zurück
            </Button>
          ) : (
            <span />
          )}

          {current.id === "uebersicht" ? (
            <Button type="button" size="lg" onClick={() => void submit()} disabled={submitting}>
              {submitting ? "Wird übermittelt …" : "Zahlungspflichtig bestellen"}
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={next}>
              Weiter →
            </Button>
          )}
        </div>
      </div>

      <OrderSummary selection={selection} plate={draft.plate} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:gap-6">
      <dt className="w-44 shrink-0 text-sm text-ink-2">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value || "–"}</dd>
    </div>
  );
}
