import { gksProvider } from "./gks-provider";
import { partnerProvider } from "./partner-provider";
import { sandboxProvider } from "./sandbox-provider";
import type { IkfzProvider } from "./types";

export * from "./types";
export * from "./eligibility";

/**
 * Auswahl des aktiven Adapters über die Umgebungsvariable IKFZ_PROVIDER:
 *   sandbox (Voreinstellung) · gks · partner
 */
export function getIkfzProvider(): IkfzProvider {
  switch (process.env.IKFZ_PROVIDER) {
    case "gks":
      return gksProvider;
    case "partner":
      return partnerProvider;
    default:
      return sandboxProvider;
  }
}

export const ikfzLiveBetrieb = getIkfzProvider().liveBetrieb;
