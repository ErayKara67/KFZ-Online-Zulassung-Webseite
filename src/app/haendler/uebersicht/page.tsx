import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Badge, ButtonLink, Container, Stat } from "@/components/ui";
import { Abmelden } from "@/components/haendler/abmelden";
import { AblageHinweis } from "@/components/haendler/ablage-hinweis";
import { dealerAusSitzung, SITZUNGSCOOKIE } from "@/lib/dealers";
import { listOrdersByDealer } from "@/lib/orders-store";
import {
  bewerteAuftrag,
  fahrzeugVon,
  kennzeichenVon,
  kundeVon,
} from "@/lib/order-status";
import { getService, formatPrice } from "@/lib/services";

export const metadata: Metadata = {
  title: "Zulassungsübersicht",
  robots: { index: false, follow: false },
};

const amZugLabel = {
  kunde: "Kundin/Kunde",
  wir: "Wir",
  behoerde: "Behörde",
  niemand: "—",
} as const;

function datum(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default async function Page() {
  const laden = await cookies();
  const dealer = dealerAusSitzung(laden.get(SITZUNGSCOOKIE)?.value);
  if (!dealer) redirect("/haendler");

  const auftraege = await listOrdersByDealer(dealer.id);
  const lagen = auftraege.map((o) => ({ order: o, lage: bewerteAuftrag(o) }));

  const fahrbereit = lagen.filter((l) => l.lage.fortschritt === "fahrbereit");
  const beiKunde = lagen.filter((l) => l.lage.amZug === "kunde");
  /* „In Bearbeitung" heißt: der Ball liegt bei uns oder der Behörde. */
  const laufend = lagen.filter(
    (l) =>
      (l.lage.amZug === "wir" || l.lage.amZug === "behoerde") &&
      !["abgeschlossen", "storniert"].includes(l.lage.fortschritt),
  );

  return (
    <Container className="py-12">
      <AblageHinweis />
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[0.75rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent-bright">
            Händlerzugang
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {dealer.name}
          </h1>
          <p className="mt-2 text-sm text-ink-3">
            {auftraege.length} {auftraege.length === 1 ? "Vorgang" : "Vorgänge"} insgesamt
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLink href="/haendler/neu" size="lg">
            Zulassung anlegen
          </ButtonLink>
          <Abmelden />
        </div>
      </div>

      {/* Kennzahlen */}
      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { wert: fahrbereit.length, label: "fahrbereit — können übergeben werden", ton: "ok" as const },
          { wert: beiKunde.length, label: "warten auf die Kundin oder den Kunden", ton: "warn" as const },
          { wert: laufend.length, label: "in Bearbeitung", ton: "accent" as const },
          {
            wert: lagen.filter((l) => l.lage.fortschritt === "abgeschlossen").length,
            label: "abgeschlossen",
            ton: "neutral" as const,
          },
        ].map((k) => (
          <div
            key={k.label}
            className={`rounded-[var(--radius-card)] border bg-card p-5 ${
              k.ton === "ok"
                ? "border-ok/30"
                : k.ton === "warn"
                  ? "border-warn/30"
                  : "border-line"
            }`}
          >
            <Stat value={k.wert} label={k.label} />
          </div>
        ))}
      </dl>

      {/* Handlungsbedarf */}
      {fahrbereit.length > 0 ? (
        <div className="mt-8 rounded-[var(--radius-card)] border border-ok/30 bg-ok-veil p-6">
          <h2 className="text-base font-bold text-ok">
            {fahrbereit.length === 1
              ? "Ein Fahrzeug kann übergeben werden"
              : `${fahrbereit.length} Fahrzeuge können übergeben werden`}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {fahrbereit.map(({ order }) => (
              <li key={order.id}>
                <Link
                  href={`/auftrag/${order.id}?code=${order.accessToken}`}
                  className="inline-flex items-center gap-2 rounded-full border border-ok/40 bg-ground px-3.5 py-1.5 text-sm font-semibold text-ink hover:border-ok"
                >
                  {kennzeichenVon(order)}
                  <span className="text-xs font-normal text-ink-3">{kundeVon(order)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Vorgangsliste */}
      <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] border border-line">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">Alle Zulassungsvorgänge dieses Autohauses</caption>
          <thead>
            <tr className="bg-card text-left">
              {["Kunde", "Fahrzeug", "Kennzeichen", "Leistung", "Status", "Am Zug", "Angelegt", ""].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3.5 text-[0.68rem] font-semibold uppercase tracking-wider text-ink-3"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {lagen.length === 0 ? (
              <tr className="border-t border-line">
                <td colSpan={8} className="px-4 py-12 text-center text-ink-3">
                  Noch keine Vorgänge. Legen Sie den ersten direkt aus dem
                  Verkaufsgespräch heraus an — Name und E-Mail genügen.
                </td>
              </tr>
            ) : (
              lagen.map(({ order, lage }) => (
                <tr key={order.id} className="border-t border-line transition-colors hover:bg-card">
                  <td className="px-4 py-3.5">
                    <span className="block font-medium text-ink">{kundeVon(order)}</span>
                    {order.dealerReferenz ? (
                      <span className="block text-xs text-ink-4">
                        Ref. {order.dealerReferenz}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-ink-2">{fahrzeugVon(order)}</td>
                  <td className="px-4 py-3.5 font-semibold text-accent-bright">
                    {kennzeichenVon(order)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-2">
                    <span className="block">{getService(order.service)?.title ?? order.service}</span>
                    <span className="block text-xs text-ink-4 tnum">
                      {formatPrice(order.totalCents)}
                      {order.ikfz?.aktiv ? " · Sofort" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={lage.ton === "accent" ? "accent" : lage.ton}>
                      {lage.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-ink-3">{amZugLabel[lage.amZug]}</td>
                  <td className="px-4 py-3.5 text-ink-3 tnum">{datum(order.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/auftrag/${order.id}?code=${order.accessToken}`}
                      className="font-semibold text-ink-2 hover:text-accent-bright"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-ink-4">
        Die Detailansicht zeigt den vollständigen Bearbeitungsstand und — bei der
        Sofortzulassung — den vorläufigen Zulassungsnachweis zum Herunterladen.
      </p>
    </Container>
  );
}
