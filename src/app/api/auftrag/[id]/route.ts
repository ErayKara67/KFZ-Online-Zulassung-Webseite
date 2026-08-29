import { NextResponse } from "next/server";
import { auftragMitCode } from "@/lib/order-access";
import { ikfzLiveBetrieb } from "@/lib/ikfz";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const code = new URL(request.url).searchParams.get("code");
  const order = await auftragMitCode(id, code);

  if (!order) {
    return NextResponse.json(
      { error: "Auftrag nicht gefunden oder Zugriffscode falsch." },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      id: order.id,
      status: order.status,
      service: order.service,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      timeline: order.timeline,
      ikfz: order.ikfz ?? null,
      sandbox: !ikfzLiveBetrieb,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
