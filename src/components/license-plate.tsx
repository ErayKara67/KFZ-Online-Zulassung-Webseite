/**
 * Darstellung eines deutschen Kennzeichens.
 *
 * Das Schild ist ein Gegenstand, kein Bedienelement: Es bleibt weiß mit
 * schwarzer Schrift und blauem EU-Feld, unabhängig vom Erscheinungsbild der
 * Seite. Deshalb stehen hier bewusst feste Farbwerte.
 */
export function LicensePlate({
  district,
  letters,
  numbers,
  size = "md",
  seal = true,
  className = "",
}: {
  district: string;
  letters: string;
  numbers: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  seal?: boolean;
  className?: string;
}) {
  const sizes = {
    xs: { h: "h-8", text: "text-[0.8rem]", band: "w-4", pad: "pl-5 pr-2", gap: "gap-1", r: "rounded-sm" },
    sm: { h: "h-11", text: "text-lg", band: "w-6", pad: "pl-8 pr-3", gap: "gap-1.5", r: "rounded" },
    md: { h: "h-16", text: "text-3xl", band: "w-9", pad: "pl-12 pr-4", gap: "gap-2", r: "rounded-md" },
    lg: { h: "h-24", text: "text-5xl", band: "w-12", pad: "pl-16 pr-6", gap: "gap-3", r: "rounded-lg" },
    xl: { h: "h-32", text: "text-6xl", band: "w-16", pad: "pl-20 pr-8", gap: "gap-4", r: "rounded-lg" },
  }[size];

  const leer = !district && !letters && !numbers;

  return (
    <div
      className={`relative inline-flex ${sizes.h} ${sizes.r} select-none items-center overflow-hidden border-[3px] border-[#0a0a0a] bg-white ${sizes.pad} shadow-[0_10px_30px_-12px_rgba(0,0,0,.85)] ${className}`}
      aria-label={
        leer
          ? "Kennzeichenvorschau, noch keine Eingabe"
          : `Kennzeichen ${district} ${letters} ${numbers}`
      }
    >
      {/* EU-Feld */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 ${sizes.band} flex flex-col items-center justify-center gap-1 bg-[var(--color-plate-blue)] py-1`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => {
            const winkel = (i / 12) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={12 + Math.sin(winkel) * 8}
                cy={12 - Math.cos(winkel) * 8}
                r="1.3"
                fill="var(--color-plate-gold)"
              />
            );
          })}
        </svg>
        <span className="text-[9px] font-bold leading-none text-white">D</span>
      </span>

      <span
        className={`flex items-center ${sizes.gap} font-bold uppercase leading-none tracking-[0.05em] text-[#0a0a0a] ${sizes.text}`}
      >
        <span className={district ? "" : "text-[#c3c7cc]"}>{district || "···"}</span>

        {seal ? (
          <span
            aria-hidden="true"
            className="mx-0.5 inline-flex h-[0.72em] w-[0.72em] items-center justify-center rounded-full border-[2.5px] border-[#0a0a0a]/75"
          >
            <span className="h-[0.2em] w-[0.2em] rounded-full bg-[#0a0a0a]/50" />
          </span>
        ) : null}

        <span className={letters ? "" : "text-[#c3c7cc]"}>{letters || "··"}</span>
        <span className={`ml-1 ${numbers ? "" : "text-[#c3c7cc]"}`}>{numbers || "···"}</span>
      </span>
    </div>
  );
}
