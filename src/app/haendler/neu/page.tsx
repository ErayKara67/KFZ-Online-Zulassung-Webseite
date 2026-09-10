import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AblageHinweis } from "@/components/haendler/ablage-hinweis";
import { VorgangAnlegen } from "@/components/haendler/vorgang-anlegen";
import { Container } from "@/components/ui";
import { dealerAusSitzung, SITZUNGSCOOKIE } from "@/lib/dealers";

export const metadata: Metadata = {
  title: "Zulassung anlegen",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const laden = await cookies();
  const dealer = dealerAusSitzung(laden.get(SITZUNGSCOOKIE)?.value);
  if (!dealer) redirect("/haendler");

  return (
    <Container className="max-w-3xl py-12">
      <Link href="/haendler/uebersicht" className="text-sm text-ink-3 hover:text-accent-bright">
        ← Zur Übersicht
      </Link>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        Zulassung anlegen
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
        Name und E-Mail genügen. Die Kundin bzw. der Kunde bekommt einen Link
        und trägt Fahrzeug-, Halter- und Zahlungsdaten selbst ein.
      </p>
      <div className="mt-9">
        <AblageHinweis />
        <VorgangAnlegen />
      </div>
    </Container>
  );
}
