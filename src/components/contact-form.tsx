"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Field, inputClass } from "./ui";
import { leseJson } from "@/lib/antwort";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          phone: String(data.get("phone") ?? ""),
          topic: String(data.get("topic") ?? ""),
          message: String(data.get("message") ?? ""),
          privacy: data.get("privacy") === "on",
          website: String(data.get("website") ?? ""),
        }),
      });
      const { ok, fehler: meldung } = await leseJson<unknown>(res);
      if (!ok) throw new Error(meldung ?? "Senden fehlgeschlagen.");
      setState("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Senden fehlgeschlagen.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] border border-ok/25 bg-ok-veil p-8">
        <h2 className="text-lg font-semibold text-ok">Nachricht ist angekommen</h2>
        <p className="mt-2 text-sm text-ok">
          Wir melden uns in der Regel am selben Werktag. Bei dringenden Fällen
          erreichen Sie uns telefonisch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[var(--radius-card)] border border-line p-6 sm:p-8" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="k-name" required>
          <input id="k-name" name="name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="E-Mail" htmlFor="k-email" required>
          <input id="k-email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>
        <Field label="Telefon" htmlFor="k-phone" hint="Optional, für schnelle Rückfragen.">
          <input id="k-phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </Field>
        <Field label="Thema" htmlFor="k-topic">
          <select id="k-topic" name="topic" className={inputClass} defaultValue="Allgemeine Frage">
            <option>Allgemeine Frage</option>
            <option>Frage zu einem laufenden Auftrag</option>
            <option>Wunschkennzeichen</option>
            <option>Zulassung / Ummeldung</option>
            <option>Abmeldung</option>
            <option>Rechnung und Zahlung</option>
            <option>Widerruf</option>
          </select>
        </Field>
        <Field label="Ihre Nachricht" htmlFor="k-message" required className="sm:col-span-2">
          <textarea id="k-message" name="message" rows={6} required className={inputClass} />
        </Field>
      </div>

      {/* Honeypot – für Menschen unsichtbar */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="k-website">Website</label>
        <input id="k-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor="k-privacy" className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-ink-2">
        <input
          id="k-privacy"
          name="privacy"
          type="checkbox"
          required
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
        />
        <span className="leading-relaxed">
          Ich habe die{" "}
          <Link href="/datenschutz" className="font-semibold text-accent-bright underline">
            Datenschutzhinweise
          </Link>{" "}
          gelesen und willige in die Verarbeitung meiner Angaben zur Bearbeitung
          der Anfrage ein.
        </span>
      </label>

      {error ? (
        <p role="alert" className="mt-5 rounded-lg bg-risk-veil px-4 py-3 text-sm font-medium text-risk">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-7" disabled={state === "sending"}>
        {state === "sending" ? "Wird gesendet …" : "Nachricht senden"}
      </Button>
    </form>
  );
}
