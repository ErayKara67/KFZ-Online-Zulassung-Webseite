import { auftragMitCode } from "@/lib/order-access";
import { bescheidAbgerufen } from "@/lib/order-flow";
import { getIkfzProvider } from "@/lib/ikfz";
import { IkfzFehler, type DokumentArt } from "@/lib/ikfz/types";

export const runtime = "nodejs";

/**
 * Liefert Zulassungsbescheid und vorläufigen Zulassungsnachweis aus.
 *
 * Die Datei kommt immer über den aktiven i-Kfz-Adapter: im Echtbetrieb das
 * von der Behörde erstellte und vom Zulassungspartner gelieferte PDF, im
 * Sandbox-Betrieb ein deutlich als Muster gekennzeichnetes Ersatzdokument.
 * Der Abruf läuft über unseren Server, damit Kundinnen und Kunden nie die
 * URL oder den Zugangstoken des Partners zu sehen bekommen.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const art = (url.searchParams.get("art") ?? "nachweis") as DokumentArt;

  if (art !== "nachweis" && art !== "bescheid") {
    return new Response("Unbekannte Dokumentart.", { status: 400 });
  }

  const order = await auftragMitCode(id, code);
  if (!order) {
    return new Response("Auftrag nicht gefunden oder Zugriffscode falsch.", { status: 404 });
  }

  const antragId = order.ikfz?.antragId;
  if (!antragId || !order.ikfz?.bescheid) {
    return new Response("Für diesen Auftrag liegt noch kein Bescheid vor.", { status: 409 });
  }

  try {
    const dokument = await getIkfzProvider().dokument(antragId, art);
    await bescheidAbgerufen(id);

    return new Response(Buffer.from(dokument.bytes), {
      headers: {
        "Content-Type": dokument.contentType,
        "Content-Disposition": `attachment; filename="${dokument.dateiname}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (fehler) {
    console.error("[dokument]", fehler);
    const nachricht =
      fehler instanceof IkfzFehler
        ? fehler.message
        : "Das Dokument konnte nicht geladen werden. Bitte versuchen Sie es erneut.";
    return new Response(nachricht, { status: 502 });
  }
}
