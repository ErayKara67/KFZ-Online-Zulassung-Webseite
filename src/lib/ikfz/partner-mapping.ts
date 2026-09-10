import type { IkfzAntrag } from "./types";

/**
 * Übersetzung des internen Datenmodells in das Schema des GKS-Partners.
 *
 * ==========================================================================
 * HIER ANPASSEN. Die Feldnamen unten sind eine plausible Annahme, kein
 * Standard – es gibt keine einheitliche Partner-API. Fordern Sie die
 * Schnittstellenbeschreibung Ihres Partners an und passen Sie ausschließlich
 * diese Datei an; der Rest der Anwendung bleibt unverändert.
 * ==========================================================================
 */

export interface PartnerAntragRequest {
  externalId: string;
  process: string;
  holder: Record<string, unknown>;
  vehicle: Record<string, unknown>;
  plate: Record<string, unknown>;
  insurance: Record<string, unknown>;
  payment: Record<string, unknown>;
  identification: Record<string, unknown>;
  powerOfAttorney: Record<string, unknown>;
  options: Record<string, unknown>;
}

const vorgangsSchluessel: Record<string, string> = {
  neuzulassung: "NEW_REGISTRATION",
  wiederzulassung: "RE_REGISTRATION",
  umschreibung: "TRANSFER",
  halterwechsel: "OWNER_CHANGE",
  adressaenderung: "ADDRESS_CHANGE",
  ausserbetriebsetzung: "DEREGISTRATION",
};

export function toPartnerRequest(antrag: IkfzAntrag): PartnerAntragRequest {
  return {
    externalId: antrag.auftragId,
    process: vorgangsSchluessel[antrag.vorgang] ?? "NEW_REGISTRATION",

    holder: {
      isCompany: antrag.halter.istFirma,
      companyName: antrag.halter.firma || undefined,
      firstName: antrag.halter.vorname,
      lastName: antrag.halter.nachname,
      dateOfBirth: antrag.halter.geburtsdatum || undefined,
      placeOfBirth: antrag.halter.geburtsort || undefined,
      street: antrag.halter.strasse,
      postalCode: antrag.halter.plz,
      city: antrag.halter.ort,
      email: antrag.halter.email,
      phone: antrag.halter.telefon,
    },

    vehicle: {
      vin: antrag.fahrzeug.fin,
      // Sicherheitscodes der Zulassungsbescheinigungen
      securityCodePartII: antrag.fahrzeug.sicherheitscodeZb2 || undefined,
      securityCodePartI: antrag.fahrzeug.sicherheitscodeZb1 || undefined,
      partIIIssuedOn: antrag.fahrzeug.zb2AusgestelltAm || undefined,
      partIIssuedOn: antrag.fahrzeug.zb1AusgestelltAm || undefined,
      inspectionValidUntil: antrag.fahrzeug.huGueltigBis || undefined,
      previousPlate: antrag.fahrzeug.bisherigesKennzeichen || undefined,
    },

    plate: {
      districtCode: antrag.kennzeichen.unterscheidungszeichen,
      letters: antrag.kennzeichen.buchstaben,
      digits: antrag.kennzeichen.zahlen,
      reservationPin: antrag.kennzeichen.reservierungsPin || undefined,
    },

    insurance: { evbNumber: antrag.evb },

    payment: {
      // SEPA-Mandat für die Kfz-Steuer
      iban: antrag.iban,
      feesInCents: antrag.gebuehrenCent,
    },

    identification: { method: antrag.identVerfahren },

    powerOfAttorney: {
      textVersion: antrag.vollmacht.textVersion,
      textHash: antrag.vollmacht.textHash,
      signature: antrag.vollmacht.unterschrift,
      grantedAt: antrag.vollmacht.erteiltAm,
      ip: antrag.vollmacht.ip,
      userAgent: antrag.vollmacht.userAgent,
      qesReference: antrag.vollmacht.qesReferenz ?? antrag.qesSignaturId,
      signatureId: antrag.qesSignaturId,
    },

    options: {
      // Der Antrag darf erst raus, wenn die Schilder beim Halter sind.
      platesAvailable: antrag.schilderVorhanden,
      requestProvisionalCertificate: true,
    },
  };
}

/**
 * Übersetzt die Antwort des Partners in das interne Modell.
 * Auch hier gilt: Feldnamen an die Dokumentation des Partners anpassen.
 */
export interface PartnerAntwortRaw {
  id?: string;
  externalId?: string;
  state?: string;
  message?: string;
  errors?: string[];
  decision?: {
    fileNumber?: string;
    authority?: string;
    plate?: string;
    issuedAt?: string;
    retrievableUntil?: string;
    validUntil?: string;
  };
}

export const statusZuordnung: Record<string, string> = {
  CREATED: "vorbereitet",
  PENDING_IDENTIFICATION: "identifizierung_offen",
  SUBMITTED: "eingereicht",
  IN_PROGRESS: "eingereicht",
  APPROVED: "bewilligt",
  REGISTERED: "bewilligt",
  REJECTED: "abgelehnt",
};
