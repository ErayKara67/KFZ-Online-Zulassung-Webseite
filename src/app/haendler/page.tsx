import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Anmeldung } from "@/components/haendler/anmeldung";
import { Container, Eyebrow } from "@/components/ui";
import {
  dealerAusSitzung,
  demoBetrieb,
  zugangFehlt,
  SITZUNGSCOOKIE,
} from "@/lib/dealers";

export const metadata: Metadata = {
  title: "Händlerzugang",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const laden = await cookies();
  if (dealerAusSitzung(laden.get(SITZUNGSCOOKIE)?.value)) {
    redirect("/haendler/uebersicht");
  }

  return (
    <Container className="max-w-md py-24">
      <Eyebrow>Für Autohäuser</Eyebrow>
      <h1 className="text-3xl font-bold tracking-tight text-ink">Händlerzugang</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-2">
        Alle Zulassungen Ihres Hauses auf einen Blick: Status je Fahrzeug, wer
        gerade am Zug ist und welche Wagen übergeben werden können.
      </p>
      <div className="mt-8">
        <Anmeldung demoBetrieb={demoBetrieb} zugangFehlt={zugangFehlt} />
      </div>
    </Container>
  );
}
