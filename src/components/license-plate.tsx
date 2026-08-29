/**
 * Visuelle Darstellung eines deutschen Kennzeichens (EU-Feld, FE-Schrift-Anmutung).
 */
export function LicensePlate({
  district,
  letters,
  numbers,
  size = "md",
  seal = true,
}: {
  district: string;
  letters: string;
  numbers: string;
  size?: "sm" | "md" | "lg";
  seal?: boolean;
}) {
  const sizes = {
    sm: { h: "h-11", text: "text-lg", band: "w-6", pad: "pl-8 pr-3", gap: "gap-1.5" },
    md: { h: "h-16", text: "text-3xl", band: "w-9", pad: "pl-12 pr-4", gap: "gap-2" },
    lg: { h: "h-24", text: "text-5xl", band: "w-12", pad: "pl-16 pr-6", gap: "gap-3" },
  }[size];

  return (
    <div
      className={`relative inline-flex ${sizes.h} select-none items-center overflow-hidden rounded-md border-[3px] border-ink-900 bg-white ${sizes.pad} shadow-sm`}
      aria-label={`Kennzeichen ${district} ${letters} ${numbers}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 ${sizes.band} flex flex-col items-center justify-between bg-[#0b3a9c] py-1`}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#ffcc00]" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={12 + Math.sin(angle) * 8}
                cy={12 - Math.cos(angle) * 8}
                r="1.2"
                fill="currentColor"
              />
            );
          })}
        </svg>
        <span className="text-[9px] font-bold leading-none text-white">D</span>
      </span>

      <span
        className={`flex items-center ${sizes.gap} font-bold uppercase leading-none tracking-[0.06em] text-ink-900 ${sizes.text}`}
      >
        <span>{district || "–"}</span>
        {seal ? (
          <span
            aria-hidden="true"
            className="mx-0.5 inline-block h-[0.7em] w-[0.7em] rounded-full border-2 border-ink-900/70"
          />
        ) : null}
        <span>{letters || "–"}</span>
        <span className="ml-1">{numbers || "–"}</span>
      </span>
    </div>
  );
}
