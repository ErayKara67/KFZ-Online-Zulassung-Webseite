import type { Metadata } from "next";
import { OrderTracker } from "@/components/order-tracker";
import { Container } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Auftrag verfolgen",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id } = await params;
  const { code } = await searchParams;

  return (
    <>
      <div className="border-b border-line bg-card">
        <Container className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-bright">
            Auftragsverfolgung
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Auftrag {id}
          </h1>
          <p className="mt-3 text-sm text-ink-2">
            Fragen zum Vorgang? {site.contact.phone} · {site.contact.hours}
          </p>
        </Container>
      </div>

      <Container className="py-12">
        {code ? (
          <OrderTracker id={id} code={code} />
        ) : (
          <div className="rounded-[var(--radius-card)] border border-warn/25 bg-warn-veil p-6">
            <h2 className="text-base font-semibold text-warn">Zugriffscode fehlt</h2>
            <p className="mt-2 text-sm text-warn">
              Bitte öffnen Sie den vollständigen Link aus Ihrer
              Auftragsbestätigung – er enthält den Zugriffscode.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
