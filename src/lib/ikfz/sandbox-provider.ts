import { promises as fs } from "node:fs";
import path from "node:path";
import {
  ABRUFFENSTER_MINUTEN,
  NACHWEIS_GUELTIGKEIT_TAGE,
  pruefeEligibility,
} from "./eligibility";
import { erzeugeDokument } from "./nachweis-pdf";
import {
  IkfzFehler,
  type DokumentArt,
  type IkfzAntrag,
  type IkfzAntwort,
  type IkfzBescheid,
  type IkfzDokument,
  type IkfzProvider,
} from "./types";

/**
 * Sandbox-Adapter.
 *
 * Bildet den fachlichen Ablauf von i-Kfz Stufe 4 vollständig ab – inklusive
 * Prüfregeln, Abruffenster und Fristen –, kommuniziert aber mit keiner
 * Behörde. Alle erzeugten Nachweise sind als Muster gekennzeichnet.
 *
 * Für den Echtbetrieb wird über IKFZ_PROVIDER auf den GKS- oder
 * Partner-Adapter umgestellt; die Anwendung selbst ändert sich nicht.
 */

const DIR = path.join(process.env.ORDER_DATA_DIR ?? ".data", "ikfz");

interface SandboxRecord {
  antrag: IkfzAntrag;
  antwort: IkfzAntwort;
}

async function write(record: SandboxRecord) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(
    path.join(DIR, `${record.antwort.antragId}.json`),
    JSON.stringify(record, null, 2),
    "utf8",
  );
}

async function read(antragId: string): Promise<SandboxRecord | null> {
  try {
    const raw = await fs.readFile(
      path.join(DIR, `${antragId.replace(/[^A-Za-z0-9_-]/g, "")}.json`),
      "utf8",
    );
    return JSON.parse(raw) as SandboxRecord;
  } catch {
    return null;
  }
}

function endeDesTages(datum: Date): Date {
  const d = new Date(datum);
  d.setHours(23, 59, 59, 999);
  return d;
}

export const sandboxProvider: IkfzProvider = {
  name: "Sandbox",
  liveBetrieb: false,

  async einreichen(antrag: IkfzAntrag): Promise<IkfzAntwort> {
    const pruefung = pruefeEligibility({
      vorgang: antrag.vorgang,
      zb1AusgestelltAm: antrag.fahrzeug.zb1AusgestelltAm,
      zb2AusgestelltAm: antrag.fahrzeug.zb2AusgestelltAm,
      sicherheitscodeZb1: antrag.fahrzeug.sicherheitscodeZb1,
      sicherheitscodeZb2: antrag.fahrzeug.sicherheitscodeZb2,
      huGueltigBis: antrag.fahrzeug.huGueltigBis,
      evb: antrag.evb,
      iban: antrag.iban,
      identVerfahren: antrag.identVerfahren,
      istFirma: antrag.halter.istFirma,
      schilderVorhanden: antrag.schilderVorhanden,
    });

    const antragId = `IKFZ-${antrag.auftragId}`;

    if (!pruefung.moeglich) {
      const antwort: IkfzAntwort = {
        status: "abgelehnt",
        antragId,
        hinweis:
          pruefung.ausschluesse[0] ??
          "Es fehlen noch Angaben für die automatisierte Entscheidung.",
        fehler: [
          ...pruefung.ausschluesse,
          ...pruefung.punkte.filter((p) => p.status === "offen").map((p) => p.hinweis),
        ],
      };
      await write({ antrag, antwort });
      return antwort;
    }

    if (!antrag.schilderVorhanden) {
      const antwort: IkfzAntwort = {
        status: "vorbereitet",
        antragId,
        hinweis:
          "Der Antrag ist vollständig. Er wird eingereicht, sobald die Kennzeichenschilder zugestellt sind.",
      };
      await write({ antrag, antwort });
      return antwort;
    }

    const jetzt = new Date();
    const bescheid: IkfzBescheid = {
      bescheidId: `${antrag.kennzeichen.unterscheidungszeichen}-${jetzt.getFullYear()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`,
      behoerde: `Zulassungsbehörde ${antrag.kennzeichen.unterscheidungszeichen}`,
      kennzeichen: `${antrag.kennzeichen.unterscheidungszeichen}-${antrag.kennzeichen.buchstaben} ${antrag.kennzeichen.zahlen}`,
      erlassenAm: jetzt.toISOString(),
      abrufBis: new Date(jetzt.getTime() + ABRUFFENSTER_MINUTEN * 60_000).toISOString(),
      gueltigBis: endeDesTages(
        new Date(jetzt.getTime() + (NACHWEIS_GUELTIGKEIT_TAGE - 1) * 86_400_000),
      ).toISOString(),
      simuliert: true,
    };

    const antwort: IkfzAntwort = {
      status: "bewilligt",
      antragId,
      bescheid,
      hinweis:
        "Automatisierter Zulassungsbescheid erteilt. Bitte innerhalb des Abruffensters herunterladen.",
    };

    await write({ antrag, antwort });
    return antwort;
  },

  async bescheidAbrufen(antragId: string): Promise<IkfzAntwort> {
    const record = await read(antragId);
    if (!record) {
      return { status: "abgelehnt", antragId, hinweis: "Antrag nicht gefunden." };
    }

    const { antwort } = record;
    if (!antwort.bescheid) return antwort;

    if (!antwort.bescheid.abgerufenAm) {
      antwort.bescheid.abgerufenAm = new Date().toISOString();
      await write(record);
    }

    return antwort;
  },

  async dokument(antragId: string, art: DokumentArt): Promise<IkfzDokument> {
    const record = await read(antragId);
    if (!record?.antwort.bescheid) {
      throw new IkfzFehler("Für diesen Antrag liegt kein Bescheid vor.", "fachlich");
    }

    const bytes = await erzeugeDokument(art, record.antrag, record.antwort.bescheid);

    return {
      bytes,
      contentType: "application/pdf",
      dateiname:
        art === "nachweis"
          ? `vorlaeufiger-zulassungsnachweis-${record.antrag.auftragId}.pdf`
          : `zulassungsbescheid-${record.antrag.auftragId}.pdf`,
    };
  },
};
