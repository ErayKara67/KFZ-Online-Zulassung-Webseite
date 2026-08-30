import type { DokumentArt, IkfzAntrag, IkfzAntwort, IkfzDokument, IkfzProvider } from "./types";

/**
 * Adapter für die eigene Großkundenschnittstelle (GKS) des KBA.
 *
 * Voraussetzungen für den Betrieb dieses Adapters:
 *  - juristische Person mit mehr als 500 Zulassungsvorgängen im Jahr
 *  - Registrierung beim Kraftfahrt-Bundesamt (einmalige Gebühr 3.220 €)
 *  - freigegebene, zertifizierte Software (XFZ-Nachrichten über OSCI-Transport)
 *  - IT-Sicherheitskonzept nach BSI-Standard, Protokollierung aller Zugriffe
 *  - ELSTER-Unternehmenskonto für die Authentifizierung
 *  - digital abgebildete Vollmacht der Kundin bzw. des Kunden
 *
 * Umsetzungshinweise:
 *  1. XFZ-Nachricht aus `antrag` erzeugen (Fachmodul der zertifizierten
 *     Bibliothek), signieren und über OSCI an das KBA übertragen.
 *  2. Antwortnachricht auswerten und auf `IkfzAntwort` abbilden.
 *  3. Zulassungsbescheid und vorläufigen Zulassungsnachweis als PDF
 *     entgegennehmen und unverändert an die Kundin bzw. den Kunden
 *     weiterreichen – niemals selbst erzeugen.
 */
export const gksProvider: IkfzProvider = {
  name: "KBA-Großkundenschnittstelle",
  liveBetrieb: true,

  async einreichen(antrag: IkfzAntrag): Promise<IkfzAntwort> {
    throw new Error(
      `GKS-Adapter ist noch nicht verdrahtet (Auftrag ${antrag.auftragId}). ` +
        "Siehe README, Abschnitt „i-Kfz anbinden“.",
    );
  },

  async bescheidAbrufen(antragId: string): Promise<IkfzAntwort> {
    throw new Error(
      `GKS-Adapter ist noch nicht verdrahtet (Antrag ${antragId}). ` +
        "Siehe README, Abschnitt „i-Kfz anbinden“.",
    );
  },

  async dokument(antragId: string, art: DokumentArt): Promise<IkfzDokument> {
    throw new Error(
      `GKS-Adapter ist noch nicht verdrahtet (Antrag ${antragId}, ${art}). ` +
        "Die Dokumente der Behörde werden hier unverändert durchgereicht.",
    );
  },
};
