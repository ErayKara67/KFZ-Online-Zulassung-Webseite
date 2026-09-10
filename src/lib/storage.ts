import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Ablage für Aufträge und Vorgangsdaten.
 *
 * Hintergrund: Auf serverlosen Hostern wie Vercel ist das Dateisystem
 * schreibgeschützt. Ein Schreibversuch bricht die Anfrage ab, und im Browser
 * kommt eine leere Antwort an. Deshalb liegt hinter jedem Schreibzugriff diese
 * Abstraktion mit drei Umsetzungen:
 *
 *   redis    – Upstash bzw. Vercel KV über die REST-Schnittstelle. Dauerhaft,
 *              die richtige Wahl im Betrieb. Wird automatisch verwendet,
 *              sobald die Zugangsdaten in der Umgebung stehen.
 *   datei    – lokales Dateisystem. Für die Entwicklung und für eigene Server.
 *   speicher – nur im Arbeitsspeicher. Notnagel, damit eine Vorführung nicht
 *              mit einem Fehler endet; Daten sind nach kurzer Zeit weg.
 */

export interface Speicher {
  readonly name: string;
  /** false, wenn Daten verloren gehen können */
  readonly dauerhaft: boolean;
  lies<T>(schluessel: string): Promise<T | null>;
  schreib<T>(schluessel: string, wert: T): Promise<void>;
  loesche(schluessel: string): Promise<void>;
  /** Mitglieder einer Menge, etwa alle Auftragsnummern eines Autohauses */
  mengeLesen(schluessel: string): Promise<string[]>;
  mengeErgaenzen(schluessel: string, wert: string): Promise<void>;
}

/* ------------------------------------------------------------------ Redis */

function redisZugang() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

async function redisBefehl<T>(befehl: (string | number)[]): Promise<T | null> {
  const zugang = redisZugang();
  if (!zugang) throw new Error("Kein Redis-Zugang konfiguriert.");

  const antwort = await fetch(zugang.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${zugang.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(befehl),
    cache: "no-store",
  });

  if (!antwort.ok) {
    throw new Error(`Ablage antwortete mit ${antwort.status}.`);
  }

  const daten = (await antwort.json()) as { result?: T; error?: string };
  if (daten.error) throw new Error(`Ablage meldet: ${daten.error}`);
  return daten.result ?? null;
}

const redisSpeicher: Speicher = {
  name: "Redis",
  dauerhaft: true,

  async lies<T>(schluessel: string): Promise<T | null> {
    const roh = await redisBefehl<string>(["GET", schluessel]);
    if (!roh) return null;
    try {
      return JSON.parse(roh) as T;
    } catch {
      return null;
    }
  },

  async schreib<T>(schluessel: string, wert: T): Promise<void> {
    await redisBefehl(["SET", schluessel, JSON.stringify(wert)]);
  },

  async loesche(schluessel: string): Promise<void> {
    await redisBefehl(["DEL", schluessel]);
  },

  async mengeLesen(schluessel: string): Promise<string[]> {
    return (await redisBefehl<string[]>(["SMEMBERS", schluessel])) ?? [];
  },

  async mengeErgaenzen(schluessel: string, wert: string): Promise<void> {
    await redisBefehl(["SADD", schluessel, wert]);
  },
};

/* ------------------------------------------------------------- Dateisystem */

const DATEI_WURZEL = process.env.ORDER_DATA_DIR ?? path.join(process.cwd(), ".data");

function pfadVon(schluessel: string): string {
  return path.join(DATEI_WURZEL, `${schluessel.replace(/[^a-zA-Z0-9_:-]/g, "_")}.json`);
}

const dateiSpeicher: Speicher = {
  name: "Dateisystem",
  dauerhaft: true,

  async lies<T>(schluessel: string): Promise<T | null> {
    try {
      return JSON.parse(await fs.readFile(pfadVon(schluessel), "utf8")) as T;
    } catch {
      return null;
    }
  },

  async schreib<T>(schluessel: string, wert: T): Promise<void> {
    await fs.mkdir(DATEI_WURZEL, { recursive: true });
    await fs.writeFile(pfadVon(schluessel), JSON.stringify(wert, null, 2), "utf8");
  },

  async loesche(schluessel: string): Promise<void> {
    await fs.rm(pfadVon(schluessel), { force: true });
  },

  async mengeLesen(schluessel: string): Promise<string[]> {
    return (await dateiSpeicher.lies<string[]>(`menge:${schluessel}`)) ?? [];
  },

  async mengeErgaenzen(schluessel: string, wert: string): Promise<void> {
    const vorhanden = await dateiSpeicher.mengeLesen(schluessel);
    if (!vorhanden.includes(wert)) {
      await dateiSpeicher.schreib(`menge:${schluessel}`, [...vorhanden, wert]);
    }
  },
};

/* ---------------------------------------------------------- Arbeitsspeicher */

/*
 * Bewusst an globalThis gehängt und nicht als Modulvariable: Next.js bündelt
 * dieselbe Datei für Seiten und API-Routen getrennt. Zwei Bündel hätten sonst
 * zwei getrennte Ablagen – ein Vorgang, den die API anlegt, fehlte dann in der
 * Händlerübersicht. Überlebt nebenbei auch das Neuladen im Entwicklungsmodus.
 */
const global = globalThis as typeof globalThis & {
  __kfzAblage?: Map<string, unknown>;
  __kfzMengen?: Map<string, Set<string>>;
  __kfzGewarnt?: boolean;
};

const ablage = (global.__kfzAblage ??= new Map<string, unknown>());
const mengen = (global.__kfzMengen ??= new Map<string, Set<string>>());

const speicherSpeicher: Speicher = {
  name: "Arbeitsspeicher",
  dauerhaft: false,

  async lies<T>(schluessel: string): Promise<T | null> {
    return (ablage.get(schluessel) as T) ?? null;
  },

  async schreib<T>(schluessel: string, wert: T): Promise<void> {
    ablage.set(schluessel, wert);
  },

  async loesche(schluessel: string): Promise<void> {
    ablage.delete(schluessel);
  },

  async mengeLesen(schluessel: string): Promise<string[]> {
    return [...(mengen.get(schluessel) ?? [])];
  },

  async mengeErgaenzen(schluessel: string, wert: string): Promise<void> {
    const menge = mengen.get(schluessel) ?? new Set<string>();
    menge.add(wert);
    mengen.set(schluessel, menge);
  },
};

/* ------------------------------------------------------------------ Auswahl */

let gewaehlt: Speicher | null = null;

export function getSpeicher(): Speicher {
  if (gewaehlt) return gewaehlt;

  if (redisZugang()) {
    gewaehlt = redisSpeicher;
  } else if (process.env.VERCEL) {
    /*
     * Auf Vercel ohne Datenbank: Das Dateisystem ist schreibgeschützt, also
     * bleibt nur der Arbeitsspeicher. Das trägt eine Vorführung, aber keinen
     * Betrieb – Aufträge verschwinden, sobald die Funktion neu startet.
     */
    if (!global.__kfzGewarnt) {
      global.__kfzGewarnt = true;
      console.warn(
        "[ablage] Keine Datenbank konfiguriert – Aufträge liegen nur im " +
          "Arbeitsspeicher und gehen verloren. Für den Betrieb Vercel KV bzw. " +
          "Upstash Redis verbinden (siehe README).",
      );
    }
    gewaehlt = speicherSpeicher;
  } else {
    gewaehlt = dateiSpeicher;
  }

  return gewaehlt;
}

/** Für Hinweise in der Oberfläche: Ist die Ablage dauerhaft? */
export function ablageDauerhaft(): boolean {
  return getSpeicher().dauerhaft;
}

export function ablageName(): string {
  return getSpeicher().name;
}
