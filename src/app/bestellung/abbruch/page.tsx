import type { Metadata } from "next";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Zahlung abgebrochen",
  robots: { index: false, follow: false },
};

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ auftrag?: string }>;
}) {
  const { auftrag } = await searchParams;

  return (
    <Container className="max-w-2xl py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        Die Zahlung wurde abgebrochen
      </h1>
      <p className="mt-4 text-lg text-ink-700">
        Es wurde nichts abgebucht. Ihr Auftrag
        {auftrag ? ` (${auftrag})` : ""} liegt bei uns als offen vor – Sie können
        die Zahlung jederzeit erneut starten.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/bestellung">Zurück zum Auftrag</ButtonLink>
        <ButtonLink href="/kontakt" variant="secondary">
          Hilfe anfordern
        </ButtonLink>
      </div>
    </Container>
  );
}
