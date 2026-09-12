"use client";

import { useState } from "react";
import Link from "next/link";
import { services, formatPrice } from "@/lib/services";
import { istSofortFaehig, sofortzulassungOption } from "@/lib/order";
import { Button, Field, inputClass } from "../ui";
import { leseJson } from "@/lib/antwort";

/**
 * Schnellerfassung für den Verkauf.
 *
 * Bewusst kurz: Name, E-Mail, Leistung. Alles Weitere trägt die Kundin bzw.
 * der Kunde selbst ein. Halterdaten, Ausweis und Bankverbindung haben am
 * Verkaufstisch nichts zu suchen.
 */
export function VorgangAnlegen() {
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [leistung, setLeistung] = useState("kfz-zulassung");
  const [sofort, setSofort] = useState(true);
  const [referenz, setReferenz] = useState("");
  const [fahrzeug, setFahrzeug] = useState("");

  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [fertig, setFertig] = useState<{ orderId: string; kundenlink: string } | null>(null);

  const sofortMoeglich = istSofortFaehig(leistung);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setLaedt(true);
    setFehler(null);
    try {
      const res = await fetch("/api/haendler/vorgang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vorname,
          nachname,
          email,
          leistung,
          sofortzulassung: sofortMoeglich && sofort,
          referenz: referenz || undefined,
          fahrzeug: fahrzeug || undefined,
        }),
      });
      const { ok, daten, fehler: meldung } = await leseJson<{
        orderId: string;
        kundenlink: string;
      }>(res);
      if (!ok || !daten) throw new Error(meldung ?? "Anlegen fehlgeschlagen.");
      setFertig({ orderId: daten.orderId, kundenlink: daten.kundenlink });
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Anlegen fehlgeschlagen.");
    } finally {
      setLaedt(false);
    }
  }

  if (fertig) {
    return (
      <div className="rounded-[var(--radius-card)] border border-ok/30 bg-ok-veil p-7">
        <h2 className="text-lg font-bold text-ok">Vorgang angelegt</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Auftragsnummer <span className="font-semibold text-ink">{fertig.orderId}</span>.
          Die Kundin bzw. der Kunde hat eine E-Mail mit dem Link bekommen und
          trägt die restlichen Angaben selbst ein.
        </p>

        <div className="mt-5">
          <p className="mb-2 text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-wider text-ink-3">
            Link zum Weitergeben
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-[var(--radius-sm)] border border-line bg-ground px-3 py-2.5 font-mono text-xs text-ink-2">
              {fertig.kundenlink}
            </code>
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard?.writeText(fertig.kundenlink)}
            >
              Kopieren
            </Button>
          </div>
          <p className="mt-2 text-xs text-ink-3">
            Praktisch, wenn die Kundin oder der Kunde direkt neben Ihnen steht.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/haendler/uebersicht"
            className="inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-accent px-5 text-sm font-semibold text-[var(--color-on-accent)] hover:bg-accent-bright"
          >
            Zur Übersicht
          </Link>
          <Button variant="secondary" onClick={() => {
            setFertig(null);
            setVorname(""); setNachname(""); setEmail(""); setReferenz(""); setFahrzeug("");
          }}>
            Nächsten Vorgang anlegen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={absenden} className="rounded-[var(--radius-card)] border border-line bg-card p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Vorname" htmlFor="v-vorname" required>
          <input id="v-vorname" value={vorname} onChange={(e) => setVorname(e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Nachname" htmlFor="v-nachname" required>
          <input id="v-nachname" value={nachname} onChange={(e) => setNachname(e.target.value)} className={inputClass} required />
        </Field>
        <Field
          label="E-Mail"
          htmlFor="v-email"
          required
          hint="An diese Adresse geht der Link zum Ausfüllen."
          className="sm:col-span-2"
        >
          <input id="v-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
        </Field>
        <Field label="Fahrzeug" htmlFor="v-fahrzeug" hint="Optional, erscheint in Ihrer Übersicht.">
          <input id="v-fahrzeug" placeholder="VW Golf 1.5 TSI" value={fahrzeug} onChange={(e) => setFahrzeug(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Ihre Referenz" htmlFor="v-referenz" hint="Kommissions- oder Auftragsnummer.">
          <input id="v-referenz" value={referenz} onChange={(e) => setReferenz(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <fieldset className="mt-7">
        <legend className="mb-3 text-sm font-semibold text-ink">Leistung</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {services.map((s) => (
            <label
              key={s.slug}
              className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border p-4 transition-colors ${
                leistung === s.slug
                  ? "border-accent bg-accent-veil"
                  : "border-line bg-raised hover:border-line-lit"
              }`}
            >
              <input
                type="radio"
                name="leistung"
                checked={leistung === s.slug}
                onChange={() => setLeistung(s.slug)}
                className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">{s.title}</span>
                <span className="block text-xs text-ink-3">{s.short}</span>
                <span className="mt-1 block text-sm font-semibold text-accent-bright tnum">
                  {formatPrice(s.price)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {sofortMoeglich ? (
        <label
          htmlFor="v-sofort"
          className={`mt-5 flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border-2 p-4 ${
            sofort ? "border-accent bg-accent-veil" : "border-line"
          }`}
        >
          <input
            id="v-sofort"
            type="checkbox"
            checked={sofort}
            onChange={(e) => setSofort(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <span>
            <span className="block text-sm font-semibold text-ink">
              Sofortzulassung — Fahrzeug zur Übergabe fahrbereit
              <span className="ml-2 font-semibold text-accent-bright">
                + {formatPrice(sofortzulassungOption.price)}
              </span>
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-3">
              Schilder gehen vorab per Express raus, der Antrag wird digital
              eingereicht. Nach dem Bescheid darf bis zu 14 Tage gefahren werden.
            </span>
          </span>
        </label>
      ) : null}

      {fehler ? (
        <p role="alert" className="mt-5 rounded-[var(--radius-sm)] bg-risk-veil px-4 py-3 text-sm font-medium text-risk">
          {fehler}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-7 w-full" disabled={laedt}>
        {laedt ? "Wird angelegt …" : "Vorgang anlegen und Link verschicken"}
      </Button>
      <p className="mt-3 text-center text-xs text-ink-3">
        Mehr braucht es von Ihnen nicht — den Rest erledigt die Kundin oder der Kunde.
      </p>
    </form>
  );
}
