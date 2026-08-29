import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import type { DokumentArt, IkfzAntrag, IkfzBescheid } from "./types";

/**
 * Erzeugt die PDF-Dokumente für den Sandbox-Betrieb.
 *
 * WICHTIG: Im Echtbetrieb werden Zulassungsbescheid und vorläufiger
 * Zulassungsnachweis von der Zulassungsbehörde erzeugt und über die
 * Schnittstelle geliefert. Diese Dateien werden dann unverändert
 * durchgereicht. Die Funktion hier dient ausschließlich dazu, den Ablauf
 * ohne Behördenanbindung testen zu können, und kennzeichnet jedes Blatt
 * deutlich als Muster.
 */

const A4: [number, number] = [595.28, 841.89];

export type { DokumentArt };

function datum(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function zeitpunkt(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function erzeugeDokument(
  art: DokumentArt,
  antrag: IkfzAntrag,
  bescheid: IkfzBescheid,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const seite = pdf.addPage(A4);
  const { width, height } = seite.getSize();

  const normal = await pdf.embedFont(StandardFonts.Helvetica);
  const fett = await pdf.embedFont(StandardFonts.HelveticaBold);

  const tinte = rgb(0.04, 0.07, 0.13);
  const grau = rgb(0.35, 0.41, 0.47);
  const blau = rgb(0.04, 0.18, 0.36);

  let y = height - 70;

  const text = (
    wert: string,
    groesse: number,
    schrift = normal,
    farbe = tinte,
    x = 60,
  ) => {
    seite.drawText(wert, { x, y, size: groesse, font: schrift, color: farbe });
  };

  const zeile = (label: string, wert: string) => {
    seite.drawText(label, { x: 60, y, size: 9.5, font: normal, color: grau });
    seite.drawText(wert, { x: 220, y, size: 11, font: fett, color: tinte });
    y -= 24;
  };

  /* Kopf */
  text(bescheid.behoerde.toUpperCase(), 9, fett, grau);
  y -= 26;
  text(
    art === "nachweis" ? "Vorläufiger Zulassungsnachweis" : "Zulassungsbescheid",
    22,
    fett,
    blau,
  );
  y -= 18;
  text(
    "Internetbasierte Fahrzeugzulassung (i-Kfz) nach der Fahrzeug-Zulassungsverordnung",
    9.5,
    normal,
    grau,
  );
  y -= 30;

  seite.drawLine({
    start: { x: 60, y },
    end: { x: width - 60, y },
    thickness: 1,
    color: rgb(0.85, 0.89, 0.94),
  });
  y -= 40;

  /* Kennzeichen groß */
  seite.drawRectangle({
    x: 60,
    y: y - 14,
    width: 260,
    height: 54,
    borderColor: tinte,
    borderWidth: 2.5,
    color: rgb(1, 1, 1),
  });
  seite.drawRectangle({
    x: 62,
    y: y - 12,
    width: 26,
    height: 50,
    color: rgb(0.04, 0.23, 0.61),
  });
  seite.drawText("D", { x: 70, y: y - 4, size: 10, font: fett, color: rgb(1, 1, 1) });
  seite.drawText(bescheid.kennzeichen, {
    x: 104,
    y: y + 4,
    size: 26,
    font: fett,
    color: tinte,
  });
  y -= 70;

  /* Daten */
  zeile("Aktenzeichen", bescheid.bescheidId);
  zeile(
    "Halterin / Halter",
    antrag.halter.istFirma && antrag.halter.firma
      ? antrag.halter.firma
      : `${antrag.halter.vorname} ${antrag.halter.nachname}`,
  );
  zeile("Anschrift", `${antrag.halter.strasse}, ${antrag.halter.plz} ${antrag.halter.ort}`);
  zeile("Fahrzeug-Identifizierungsnummer", antrag.fahrzeug.fin);
  zeile("Erlassen am", zeitpunkt(bescheid.erlassenAm));

  if (art === "nachweis") {
    zeile("Gültig bis einschließlich", datum(bescheid.gueltigBis));
  }

  y -= 10;
  seite.drawLine({
    start: { x: 60, y },
    end: { x: width - 60, y },
    thickness: 1,
    color: rgb(0.85, 0.89, 0.94),
  });
  y -= 34;

  /* Hinweise */
  text(art === "nachweis" ? "Hinweise zur Nutzung" : "Hinweise", 12, fett, tinte);
  y -= 20;

  const hinweise =
    art === "nachweis"
      ? [
          "Dieser Nachweis ist während der Fahrt gut sichtbar im Fahrzeug anzubringen.",
          "Die Fahrberechtigung gilt zehn Kalendertage ab Erlass des Bescheids.",
          "Die Kennzeichenschilder müssen angebracht sein; sie dürfen in diesem",
          "Zeitraum noch ungesiegelt sein.",
          "Zulassungsbescheid und Zulassungsbescheinigung Teil I sind mitzuführen.",
          "Stempelplaketten und Papiere kommen per Post und sind nach Erhalt",
          "unverzüglich anzubringen. Danach ist dieser Nachweis zu vernichten.",
        ]
      : [
          "Das Fahrzeug ist mit dem oben genannten Kennzeichen zugelassen.",
          "Zulassungsbescheinigung Teil I und Teil II sowie die Plakettenträger",
          "werden auf dem Postweg zugestellt.",
          "Die Kraftfahrzeugsteuer wird per SEPA-Lastschrift eingezogen.",
        ];

  for (const h of hinweise) {
    text(h, 10, normal, tinte);
    y -= 16;
  }

  /* Musterkennzeichnung */
  if (bescheid.simuliert) {
    seite.drawText("MUSTER - SANDBOX", {
      x: 95,
      y: 300,
      size: 52,
      font: fett,
      color: rgb(0.85, 0.2, 0.16),
      opacity: 0.16,
      rotate: degrees(32),
    });

    seite.drawRectangle({
      x: 60,
      y: 70,
      width: width - 120,
      height: 62,
      color: rgb(0.99, 0.95, 0.86),
      borderColor: rgb(0.85, 0.62, 0.13),
      borderWidth: 1,
    });
    seite.drawText("Kein amtliches Dokument", {
      x: 76,
      y: 108,
      size: 11,
      font: fett,
      color: rgb(0.42, 0.29, 0.02),
    });
    seite.drawText(
      "Erzeugt im Testbetrieb ohne Anbindung an eine Zulassungsbehoerde.",
      { x: 76, y: 92, size: 9.5, font: normal, color: rgb(0.42, 0.29, 0.02) },
    );
    seite.drawText(
      "Berechtigt nicht zur Teilnahme am Strassenverkehr.",
      { x: 76, y: 78, size: 9.5, font: normal, color: rgb(0.42, 0.29, 0.02) },
    );
  }

  return pdf.save();
}
