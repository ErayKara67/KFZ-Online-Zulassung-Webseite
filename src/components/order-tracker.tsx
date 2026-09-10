"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, Check } from "./ui";
import { LicensePlate } from "./license-plate";
import { leseJson } from "@/lib/antwort";

interface TimelineEntry {
  key: string;
  at: string;
  note?: string;
}

interface Bescheid {
  bescheidId: string;
  behoerde: string;
  kennzeichen: string;
  erlassenAm: string;
  abrufBis: string;
  gueltigBis: string;
  abgerufenAm?: string;
  simuliert: boolean;
}

interface AuftragsStatus {
  id: string;
  status: string;
  service: string;
  timeline: TimelineEntry[];
  ikfz: {
    aktiv: boolean;
    identVerfahren: string;
    identifiziertAm?: string;
    bescheid?: Bescheid;
    hinweis?: string;
  } | null;
  signatur: {
    art: string;
    status: string;
    simuliert: boolean;
    provider: string;
  } | null;
  sandbox: boolean;
}

const SCHRITTE: { key: string; label: string; text: string }[] = [
  { key: "bestellt", label: "Auftrag eingegangen", text: "Ihre Angaben liegen uns vor." },
  { key: "bezahlt", label: "Zahlung bestätigt", text: "Wir starten mit der Bearbeitung." },
  {
    key: "kennzeichen_reserviert",
    label: "Kennzeichen reserviert",
    text: "Die Kombination ist für Sie gesperrt.",
  },
  { key: "schilder_produziert", label: "Schilder geprägt", text: "Aluminiumschilder nach DIN 74069." },
  { key: "schilder_versandt", label: "Schilder versandt", text: "Express-Zustellung ist unterwegs." },
  {
    key: "schilder_zugestellt",
    label: "Schilder zugestellt",
    text: "Voraussetzung für den Zulassungsantrag.",
  },
  {
    key: "identifiziert",
    label: "Identifizierung abgeschlossen",
    text: "Elektronischer Identitätsnachweis liegt vor.",
  },
  {
    key: "vollmacht_signiert",
    label: "Vollmacht qualifiziert signiert",
    text: "Erforderlich nach § 38 FZV für den Antrag über die Großkundenschnittstelle.",
  },
  {
    key: "antrag_eingereicht",
    label: "Antrag eingereicht",
    text: "Der Vorgang liegt bei der Zulassungsbehörde.",
  },
  {
    key: "bescheid_erteilt",
    label: "Zulassungsbescheid erteilt",
    text: "Jetzt innerhalb des Abruffensters herunterladen.",
  },
  {
    key: "bescheid_abgerufen",
    label: "Unterlagen abgerufen",
    text: "Vorläufiger Zulassungsnachweis liegt bei Ihnen.",
  },
  {
    key: "unterlagen_versandt",
    label: "Papiere und Plaketten versandt",
    text: "Kommen per Post von der Behörde.",
  },
  { key: "abgeschlossen", label: "Vorgang abgeschlossen", text: "Alles erledigt." },
];

function zeit(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function restzeit(bis: string): { text: string; abgelaufen: boolean; sekunden: number } {
  const diff = new Date(bis).getTime() - Date.now();
  if (diff <= 0) return { text: "abgelaufen", abgelaufen: true, sekunden: 0 };

  const sek = Math.floor(diff / 1000);
  const tage = Math.floor(sek / 86400);
  const std = Math.floor((sek % 86400) / 3600);
  const min = Math.floor((sek % 3600) / 60);
  const s = sek % 60;

  if (tage > 0) return { text: `${tage} Tage ${std} Std.`, abgelaufen: false, sekunden: sek };
  if (std > 0) return { text: `${std} Std. ${min} Min.`, abgelaufen: false, sekunden: sek };
  return {
    text: `${min}:${String(s).padStart(2, "0")} Min.`,
    abgelaufen: false,
    sekunden: sek,
  };
}

export function OrderTracker({ id, code }: { id: string; code: string }) {
  const [daten, setDaten] = useState<AuftragsStatus | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [laden, setLaden] = useState(true);
  const [tick, setTick] = useState(0);

  const holen = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/auftrag/${encodeURIComponent(id)}?code=${encodeURIComponent(code)}`,
        { cache: "no-store" },
      );
      const { ok, daten: json, fehler: meldung } = await leseJson<AuftragsStatus>(res);
      if (!ok || !json) throw new Error(meldung ?? "Auftrag nicht gefunden.");
      setDaten(json);
      setFehler(null);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setLaden(false);
    }
  }, [id, code]);

  useEffect(() => {
    // Erstabruf des Auftragsstatus – der State wird erst in der
    // asynchronen Fortsetzung gesetzt, nicht synchron im Effektkörper.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void holen();
  }, [holen]);

  /* Sekundentakt für die Countdowns */
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /* Auffrischen, solange der Vorgang läuft */
  useEffect(() => {
    const t = setInterval(() => void holen(), 20_000);
    return () => clearInterval(t);
  }, [holen]);

  async function aktion(name: string) {
    setHinweis(null);
    try {
      const res = await fetch(`/api/auftrag/${encodeURIComponent(id)}/aktion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, aktion: name }),
      });
      const { ok, daten: json, fehler: meldung } = await leseJson<{
        hinweis?: string;
        weiterleitungUrl?: string;
      }>(res);
      if (!ok) throw new Error(json?.hinweis ?? meldung ?? "Aktion fehlgeschlagen.");
      if (json?.weiterleitungUrl) {
        window.location.assign(json.weiterleitungUrl);
        return;
      }
      await holen();
    } catch (e) {
      setHinweis(e instanceof Error ? e.message : "Aktion fehlgeschlagen.");
    }
  }

  if (laden) {
    return <p className="py-16 text-center text-sm text-ink-2">Auftrag wird geladen …</p>;
  }

  if (fehler || !daten) {
    return (
      <div className="rounded-[var(--radius-card)] border border-risk/25 bg-risk-veil p-6">
        <h2 className="text-base font-semibold text-risk">Kein Zugriff</h2>
        <p className="mt-2 text-sm text-risk">{fehler}</p>
        <p className="mt-4 text-sm text-risk">
          Bitte öffnen Sie den Link aus Ihrer Auftragsbestätigung erneut.
        </p>
      </div>
    );
  }

  const erledigt = new Set(daten.timeline.map((t) => t.key));
  const eintrag = (key: string) => daten.timeline.find((t) => t.key === key);
  const bescheid = daten.ikfz?.bescheid;
  const sofort = Boolean(daten.ikfz?.aktiv);

  const sichtbareSchritte = SCHRITTE.filter((s) => {
    if (sofort) return true;
    return ![
      "identifiziert",
      "vollmacht_signiert",
      "antrag_eingereicht",
      "bescheid_erteilt",
      "bescheid_abgerufen",
    ].includes(s.key);
  });

  const abruf = bescheid ? restzeit(bescheid.abrufBis) : null;
  const fahrfrist = bescheid ? restzeit(bescheid.gueltigBis) : null;
  void tick; // erzwingt die Neuberechnung im Sekundentakt

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem]">
      <div>
        {/* Fahrberechtigung */}
        {bescheid ? (
          <div
            className={`mb-9 rounded-[var(--radius-card)] border-2 p-6 ${
              fahrfrist?.abgelaufen
                ? "border-risk/30 bg-risk-veil"
                : "border-ok/30 bg-ok-veil"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-ok">
              {fahrfrist?.abgelaufen ? "Fahrberechtigung abgelaufen" : "Sie dürfen fahren"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {bescheid.kennzeichen} ist zugelassen
            </h2>
            <p className="mt-2 text-sm text-ink-2">
              Aktenzeichen {bescheid.bescheidId} · {bescheid.behoerde} · erteilt am{" "}
              {zeit(bescheid.erlassenAm)}
            </p>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-card p-4">
                <dt className="text-xs text-ink-2">Fahrberechtigung endet</dt>
                <dd className="mt-1 text-lg font-semibold text-ink">
                  {new Date(bescheid.gueltigBis).toLocaleDateString("de-DE")}
                </dd>
                <dd className="text-xs text-ink-2">
                  noch {fahrfrist?.text}
                </dd>
              </div>
              <div className="rounded-lg bg-card p-4">
                <dt className="text-xs text-ink-2">Abruffenster für die Unterlagen</dt>
                <dd
                  className={`mt-1 text-lg font-semibold ${
                    abruf?.abgelaufen ? "text-risk" : "text-ink"
                  }`}
                >
                  {abruf?.abgelaufen ? "abgelaufen" : abruf?.text}
                </dd>
                <dd className="text-xs text-ink-2">
                  {bescheid.abgerufenAm
                    ? `abgerufen am ${zeit(bescheid.abgerufenAm)}`
                    : "Bitte jetzt herunterladen"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`/api/auftrag/${encodeURIComponent(id)}/dokument?code=${encodeURIComponent(code)}&art=nachweis`}
                className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-[var(--color-on-accent)] hover:bg-accent-bright"
              >
                Vorläufigen Zulassungsnachweis herunterladen
              </a>
              <a
                href={`/api/auftrag/${encodeURIComponent(id)}/dokument?code=${encodeURIComponent(code)}&art=bescheid`}
                className="inline-flex h-11 items-center rounded-lg border border-line bg-card px-5 text-sm font-semibold text-accent-bright hover:border-accent"
              >
                Zulassungsbescheid
              </a>
            </div>

            <ol className="mt-6 space-y-2 border-t border-ok/20 pt-5 text-sm text-ink-2">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                Nachweis ausdrucken und gut sichtbar im Fahrzeug anbringen.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                Kennzeichenschilder montieren – in diesem Zeitraum noch ohne Plaketten zulässig.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                Zulassungsbescheid mitführen; Plaketten nach Erhalt sofort anbringen.
              </li>
            </ol>
          </div>
        ) : null}

        {/* Zeitstrahl */}
        <h2 className="text-lg font-semibold text-ink">Bearbeitungsstand</h2>
        <ol className="mt-6 space-y-0">
          {sichtbareSchritte.map((schritt, i) => {
            const fertig = erledigt.has(schritt.key);
            const info = eintrag(schritt.key);
            const naechster =
              !fertig && sichtbareSchritte.slice(0, i).every((s) => erledigt.has(s.key));

            return (
              <li key={schritt.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      fertig
                        ? "bg-ok text-[var(--color-on-accent)]"
                        : naechster
                          ? "border-2 border-accent bg-card text-accent-bright"
                          : "border border-line bg-card text-ink-3"
                    }`}
                  >
                    {fertig ? "✓" : i + 1}
                  </span>
                  {i < sichtbareSchritte.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className={`w-px flex-1 ${fertig ? "bg-ok/40" : "bg-line"}`}
                    />
                  ) : null}
                </div>

                <div className={`pb-7 ${fertig ? "" : "opacity-70"}`}>
                  <p className="text-sm font-semibold text-ink">{schritt.label}</p>
                  <p className="mt-0.5 text-sm text-ink-2">{info?.note ?? schritt.text}</p>
                  {info ? (
                    <p className="mt-1 text-xs text-ink-3">{zeit(info.at)}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {hinweis ? (
          <p role="alert" className="mt-4 rounded-lg bg-warn-veil px-4 py-3 text-sm text-warn">
            {hinweis}
          </p>
        ) : null}
      </div>

      {/* Seitenspalte */}
      <aside className="space-y-6">
        <Card className="bg-card">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-2">Auftrag</h2>
          <p className="mt-3 text-lg font-semibold text-ink">{daten.id}</p>
          <p className="text-sm text-ink-2">
            {sofort ? "Sofortzulassung (i-Kfz Stufe 4)" : "Standardabwicklung"}
          </p>
          {bescheid ? (
            <div className="mt-4">
              <LicensePlate
                district={bescheid.kennzeichen.split("-")[0] ?? ""}
                letters={bescheid.kennzeichen.split("-")[1]?.split(" ")[0] ?? ""}
                numbers={bescheid.kennzeichen.split(" ")[1] ?? ""}
                size="sm"
              />
            </div>
          ) : null}
        </Card>

        {/* Kundenaktionen */}
        {sofort && !erledigt.has("identifiziert") ? (
          <Card>
            <h2 className="text-base font-semibold text-ink">Jetzt identifizieren</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {daten.ikfz?.identVerfahren === "eid"
                ? "Halten Sie Ihren Personalausweis und die sechsstellige PIN bereit. Die Identifizierung läuft über die AusweisApp."
                : daten.ikfz?.identVerfahren === "elster"
                  ? "Melden Sie sich mit dem Organisationszertifikat Ihres ELSTER-Unternehmenskontos an."
                  : "Sie werden zu unserem Identifizierungspartner weitergeleitet."}
            </p>
            <Button className="mt-4 w-full" onClick={() => void aktion("identifizierung")}>
              Identifizierung starten
            </Button>
          </Card>
        ) : null}

        {sofort && erledigt.has("identifiziert") && !erledigt.has("vollmacht_signiert") ? (
          <Card>
            <h2 className="text-base font-semibold text-ink">Vollmacht signieren</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Für den Antrag bei der Zulassungsbehörde braucht die Vollmacht eine
              qualifizierte elektronische Signatur (§ 38 FZV). Ein Häkchen oder
              eine getippte Unterschrift genügen dafür nicht.
            </p>
            <Button className="mt-4 w-full" onClick={() => void aktion("vollmacht_signieren")}>
              Jetzt signieren
            </Button>
          </Card>
        ) : null}

        {daten.signatur?.simuliert ? (
          <Card className="border-warn/30 bg-warn-veil">
            <h2 className="text-sm font-semibold text-warn">
              Signatur aus dem Testbetrieb
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-warn">
              Diese Vollmacht wurde nicht qualifiziert signiert und ist rechtlich
              nicht verwendbar. Für den Echtbetrieb muss ein qualifizierter
              Vertrauensdiensteanbieter hinterlegt werden.
            </p>
          </Card>
        ) : null}

        {sofort &&
        erledigt.has("identifiziert") &&
        erledigt.has("vollmacht_signiert") &&
        erledigt.has("schilder_zugestellt") &&
        !erledigt.has("antrag_eingereicht") ? (
          <Card>
            <h2 className="text-base font-semibold text-ink">Alles bereit</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Schilder sind zugestellt und Ihre Identität ist nachgewiesen. Jetzt
              geht der Antrag an die Zulassungsbehörde.
            </p>
            <Button className="mt-4 w-full" onClick={() => void aktion("antrag_einreichen")}>
              Zulassung beantragen
            </Button>
          </Card>
        ) : null}

        {/* Sandbox-Steuerung */}
        {daten.sandbox ? (
          <Card className="border-warn/30 bg-warn-veil">
            <h2 className="text-sm font-semibold text-warn">Sandbox-Steuerung</h2>
            <p className="mt-2 text-xs leading-relaxed text-warn">
              Sichtbar, solange keine echte Behördenschnittstelle angebunden ist.
              Damit lassen sich Ereignisse auslösen, die sonst vom
              Versanddienstleister und von der Behörde kommen.
            </p>
            <div className="mt-4 grid gap-2">
              <Button
                variant="secondary"
                onClick={() => void aktion("demo_schilder_versandt")}
                disabled={erledigt.has("schilder_versandt")}
              >
                Schilder versandt melden
              </Button>
              <Button
                variant="secondary"
                onClick={() => void aktion("demo_schilder_zugestellt")}
                disabled={erledigt.has("schilder_zugestellt")}
              >
                Zustellung bestätigen
              </Button>
            </div>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
