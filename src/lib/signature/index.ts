/**
 * Qualifizierte elektronische Signatur der Vollmacht.
 *
 * § 38 FZV verlangt für Vollmachten, die über die Großkundenschnittstelle
 * übermittelt werden:
 *   - natürliche Personen: qualifizierte elektronische Signatur (QES)
 *   - juristische Personen: qualifiziertes elektronisches Siegel oder QES
 *     einer vertretungsberechtigten Person, deren Vertretungsberechtigung ein
 *     qualifizierter Vertrauensdiensteanbieter geprüft hat
 *
 * Eine getippte oder gemalte Unterschrift und ein Bestätigungshaken erfüllen
 * das NICHT. Deshalb läuft die Signatur über einen eIDAS-konformen
 * Vertrauensdiensteanbieter (QTSP) – austauschbar hinter diesem Interface.
 */

export type SignaturArt = "qes" | "siegel";
export type SignaturStatus = "offen" | "signiert" | "abgebrochen" | "abgelaufen";

export interface SignaturVorgang {
  signaturId: string;
  status: SignaturStatus;
  art: SignaturArt;
  /** Ziel, zu dem die Kundin bzw. der Kunde zum Signieren geschickt wird */
  weiterleitungUrl?: string;
  signiertAm?: string;
  /** Ergebnis der Signaturprüfung nach der Rückkehr */
  pruefung?: "gueltig" | "ungueltig" | "ausstehend";
  /** true, wenn der Vorgang aus dem Testbetrieb stammt und rechtlich wertlos ist */
  simuliert: boolean;
}

export interface SignaturAnfrage {
  auftragId: string;
  istFirma: boolean;
  name: string;
  email: string;
  /** Hash des Vollmachtsdokuments, das signiert werden soll */
  dokumentHash: string;
  rueckkehrUrl: string;
}

export interface SignatureProvider {
  readonly name: string;
  /** true nur, wenn der Anbieter tatsächlich QES bzw. Siegel liefert */
  readonly qualifiziert: boolean;
  starten(anfrage: SignaturAnfrage): Promise<SignaturVorgang>;
  status(signaturId: string): Promise<SignaturVorgang>;
}

/* ------------------------------------------------------------- Sandbox */

const sandboxProvider: SignatureProvider = {
  name: "Sandbox",
  qualifiziert: false,

  async starten(anfrage: SignaturAnfrage): Promise<SignaturVorgang> {
    return {
      signaturId: `SIG-${anfrage.auftragId}`,
      status: "signiert",
      art: anfrage.istFirma ? "siegel" : "qes",
      signiertAm: new Date().toISOString(),
      pruefung: "gueltig",
      simuliert: true,
    };
  },

  async status(signaturId: string): Promise<SignaturVorgang> {
    return {
      signaturId,
      status: "signiert",
      art: "qes",
      pruefung: "gueltig",
      simuliert: true,
    };
  },
};

/* ---------------------------------------------------------------- QTSP */

/**
 * Adapter für einen qualifizierten Vertrauensdiensteanbieter.
 * Endpunkte und Feldnamen an die Dokumentation des gewählten Anbieters
 * anpassen; die übrige Anwendung bleibt unverändert.
 */
const qtspProvider: SignatureProvider = {
  name: "QTSP",
  qualifiziert: true,

  async starten(anfrage: SignaturAnfrage): Promise<SignaturVorgang> {
    const basis = process.env.SIGNATURE_QTSP_URL;
    const token = process.env.SIGNATURE_QTSP_TOKEN;
    if (!basis || !token) {
      throw new Error(
        "SIGNATURE_QTSP_URL oder SIGNATURE_QTSP_TOKEN fehlt. Siehe .env.example.",
      );
    }

    const res = await fetch(`${basis.replace(/\/+$/, "")}/signature-requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reference: anfrage.auftragId,
        signatureLevel: anfrage.istFirma ? "QUALIFIED_SEAL" : "QUALIFIED_SIGNATURE",
        signerName: anfrage.name,
        signerEmail: anfrage.email,
        documentHash: anfrage.dokumentHash,
        redirectUrl: anfrage.rueckkehrUrl,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      throw new Error(`Signaturdienst antwortete mit ${res.status}.`);
    }

    const daten = (await res.json()) as {
      id: string;
      redirectUrl?: string;
      state?: string;
    };

    return {
      signaturId: daten.id,
      status: "offen",
      art: anfrage.istFirma ? "siegel" : "qes",
      weiterleitungUrl: daten.redirectUrl,
      pruefung: "ausstehend",
      simuliert: false,
    };
  },

  async status(signaturId: string): Promise<SignaturVorgang> {
    const basis = process.env.SIGNATURE_QTSP_URL;
    const token = process.env.SIGNATURE_QTSP_TOKEN;
    if (!basis || !token) throw new Error("Signaturdienst nicht konfiguriert.");

    const res = await fetch(
      `${basis.replace(/\/+$/, "")}/signature-requests/${encodeURIComponent(signaturId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (!res.ok) throw new Error(`Signaturdienst antwortete mit ${res.status}.`);

    const daten = (await res.json()) as {
      state?: string;
      signedAt?: string;
      validation?: string;
      signatureLevel?: string;
    };

    const status: SignaturStatus =
      daten.state === "SIGNED"
        ? "signiert"
        : daten.state === "CANCELLED"
          ? "abgebrochen"
          : daten.state === "EXPIRED"
            ? "abgelaufen"
            : "offen";

    return {
      signaturId,
      status,
      art: daten.signatureLevel === "QUALIFIED_SEAL" ? "siegel" : "qes",
      signiertAm: daten.signedAt,
      pruefung:
        daten.validation === "VALID"
          ? "gueltig"
          : daten.validation === "INVALID"
            ? "ungueltig"
            : "ausstehend",
      simuliert: false,
    };
  },
};

/* ------------------------------------------------------------- Partner */

/**
 * Signatur über den Zulassungspartner.
 *
 * Bringt der GKS-Partner die QES selbst mit – wie es bei Zulio der Fall ist –,
 * läuft die Signatur über dieselbe Schnittstelle wie der Zulassungsantrag.
 * Das spart einen zweiten Vertrag und einen Markenbruch mitten im
 * Bestellprozess. Endpunktnamen an die Dokumentation des Partners anpassen.
 */
const partnerSignatureProvider: SignatureProvider = {
  name: "Zulassungspartner",
  qualifiziert: true,

  async starten(anfrage: SignaturAnfrage): Promise<SignaturVorgang> {
    const basis = process.env.IKFZ_PARTNER_URL;
    const token = process.env.IKFZ_PARTNER_TOKEN;
    if (!basis || !token) {
      throw new Error(
        "IKFZ_PARTNER_URL oder IKFZ_PARTNER_TOKEN fehlt – die Signatur läuft über den Zulassungspartner.",
      );
    }

    const res = await fetch(`${basis.replace(/\/+$/, "")}/signaturen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        externalId: anfrage.auftragId,
        signatureLevel: anfrage.istFirma ? "QUALIFIED_SEAL" : "QUALIFIED_SIGNATURE",
        signerName: anfrage.name,
        signerEmail: anfrage.email,
        documentHash: anfrage.dokumentHash,
        redirectUrl: anfrage.rueckkehrUrl,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`Signaturdienst des Partners antwortete mit ${res.status}.`);

    const daten = (await res.json()) as { id: string; redirectUrl?: string };

    return {
      signaturId: daten.id,
      status: "offen",
      art: anfrage.istFirma ? "siegel" : "qes",
      weiterleitungUrl: daten.redirectUrl,
      pruefung: "ausstehend",
      simuliert: false,
    };
  },

  async status(signaturId: string): Promise<SignaturVorgang> {
    const basis = process.env.IKFZ_PARTNER_URL;
    const token = process.env.IKFZ_PARTNER_TOKEN;
    if (!basis || !token) throw new Error("Zulassungspartner nicht konfiguriert.");

    const res = await fetch(
      `${basis.replace(/\/+$/, "")}/signaturen/${encodeURIComponent(signaturId)}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30_000) },
    );

    if (!res.ok) throw new Error(`Signaturdienst des Partners antwortete mit ${res.status}.`);

    const daten = (await res.json()) as {
      state?: string;
      signedAt?: string;
      validation?: string;
      signatureLevel?: string;
    };

    return {
      signaturId,
      status:
        daten.state === "SIGNED"
          ? "signiert"
          : daten.state === "CANCELLED"
            ? "abgebrochen"
            : daten.state === "EXPIRED"
              ? "abgelaufen"
              : "offen",
      art: daten.signatureLevel === "QUALIFIED_SEAL" ? "siegel" : "qes",
      signiertAm: daten.signedAt,
      pruefung: daten.validation === "VALID" ? "gueltig" : "ausstehend",
      simuliert: false,
    };
  },
};

export function getSignatureProvider(): SignatureProvider {
  switch (process.env.SIGNATURE_PROVIDER) {
    case "partner":
      return partnerSignatureProvider;
    case "qtsp":
      return qtspProvider;
    default:
      return sandboxProvider;
  }
}

export const signaturQualifiziert = getSignatureProvider().qualifiziert;
