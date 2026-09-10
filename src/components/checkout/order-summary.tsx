"use client";

import { formatPrice, getService } from "@/lib/services";
import { priceLines, totalCents, vatOf, type OptionSelection } from "@/lib/order";
import { LicensePlate } from "../license-plate";

export function OrderSummary({
  selection,
  plate,
  sticky = true,
}: {
  selection: OptionSelection;
  plate?: { district: string; letters: string; numbers: string };
  sticky?: boolean;
}) {
  const service = getService(selection.service);
  const lines = priceLines(selection);
  const total = totalCents(selection);
  const vat = vatOf(total);

  return (
    <aside
      className={`rounded-[var(--radius-card)] border border-line bg-card p-6 ${
        sticky ? "lg:sticky lg:top-28" : ""
      }`}
      aria-label="Bestellübersicht"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-2">
        Ihre Bestellung
      </h2>

      {plate && plate.district ? (
        <div className="mt-4">
          <LicensePlate
            district={plate.district}
            letters={plate.letters}
            numbers={plate.numbers}
            size="sm"
          />
        </div>
      ) : null}

      <dl className="mt-5 space-y-2.5 text-sm">
        {lines.map((line, i) => (
          <div key={`${line.label}-${i}`} className="flex justify-between gap-4">
            <dt className="text-ink-2">{line.label}</dt>
            <dd className="font-medium text-ink">{formatPrice(line.amount)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-ink">Gesamt</span>
          <span className="text-2xl font-semibold text-ink">{formatPrice(total)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-2">
          inkl. {formatPrice(vat)} USt. · amtliche Gebühren enthalten
        </p>
      </div>

      {service ? (
        <p className="mt-5 rounded-lg bg-card p-4 text-xs leading-relaxed text-ink-2">
          <span className="font-semibold text-ink-2">Bearbeitungszeit:</span>{" "}
          {service.duration}
        </p>
      ) : null}
    </aside>
  );
}
