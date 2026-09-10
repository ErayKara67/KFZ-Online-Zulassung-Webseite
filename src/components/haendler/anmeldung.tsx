"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, inputClass } from "../ui";

export function Anmeldung({ demoBetrieb }: { demoBetrieb: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setLaedt(true);
    setFehler(null);
    try {
      const res = await fetch("/api/haendler/anmelden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Anmeldung fehlgeschlagen.");
      router.push("/haendler/uebersicht");
      router.refresh();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Anmeldung fehlgeschlagen.");
      setLaedt(false);
    }
  }

  return (
    <form onSubmit={absenden} className="rounded-[var(--radius-card)] border border-line bg-card p-7">
      <Field label="Zugangscode" htmlFor="dealer-code" required>
        <input
          id="dealer-code"
          type="password"
          autoComplete="current-password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={inputClass}
        />
      </Field>

      {fehler ? (
        <p role="alert" className="mt-4 rounded-[var(--radius-sm)] bg-risk-veil px-4 py-3 text-sm font-medium text-risk">
          {fehler}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={laedt}>
        {laedt ? "Wird geprüft …" : "Anmelden"}
      </Button>

      {demoBetrieb ? (
        <p className="mt-5 rounded-[var(--radius-sm)] border border-warn/25 bg-warn-veil px-4 py-3 text-xs leading-relaxed text-warn">
          <strong>Demozugang aktiv.</strong> Code: <code className="font-mono">demo</code>.
          Sobald echte Händlerzugänge hinterlegt sind, ist dieser Zugang gesperrt.
        </p>
      ) : null}
    </form>
  );
}
