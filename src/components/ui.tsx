import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Abschnittsflächen.
 * base   – Grundfläche der Seite
 * raised – abgesetzte Fläche für Blöcke, die sich abheben sollen
 * accent – Markenband, sparsam einsetzen
 */
export function Section({
  children,
  className = "",
  tone = "base",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "base" | "raised" | "accent";
  id?: string;
}) {
  const tones = {
    base: "bg-ground",
    raised: "bg-card",
    accent: "bg-accent text-[var(--color-on-accent)]",
  } as const;
  return (
    <section id={id} className={`${tones[tone]} py-18 sm:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent-bright">
      <span aria-hidden="true" className="h-px w-7 bg-accent" />
      {children}
    </p>
  );
}

export function H2({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-balance text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.6rem] ${className}`}
    >
      {children}
    </h2>
  );
}

export function Lead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`mt-5 max-w-2xl text-lg leading-relaxed text-ink-2 ${className}`}>
      {children}
    </p>
  );
}

const buttonStyles = {
  primary:
    "bg-accent text-[var(--color-on-accent)] hover:bg-accent-bright active:bg-accent-deep font-semibold",
  secondary:
    "bg-raised text-ink border border-line hover:border-line-lit hover:bg-card",
  ghost: "text-accent-bright hover:bg-accent-veil",
  quiet: "bg-[var(--color-on-accent)] text-ink hover:bg-ground",
  outline:
    "border border-[var(--color-on-accent)]/25 text-[var(--color-on-accent)] hover:bg-[var(--color-on-accent)]/10",
} as const;

const buttonSizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.95rem]",
} as const;

type ButtonVariant = keyof typeof buttonStyles;

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold transition-colors ${buttonStyles[variant]} ${buttonSizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: keyof typeof buttonSizes;
} & ComponentProps<"button">) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${buttonSizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-line bg-card p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "ok" | "warn" | "risk" | "neutral";
}) {
  const tones = {
    accent: "bg-accent-veil text-accent-bright ring-accent/30",
    ok: "bg-ok-veil text-ok ring-ok/30",
    warn: "bg-warn-veil text-warn ring-warn/30",
    risk: "bg-risk-veil text-risk ring-risk/30",
    neutral: "bg-raised text-ink-2 ring-line",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wider ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
        {required ? <span className="text-accent-bright"> *</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-risk">{error}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-line bg-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none";

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 10.5 4 4 8-9" />
    </svg>
  );
}

/** Kennzahl mit Beschriftung – für Hero und Kennzahlenreihen. */
export function Stat({
  value,
  label,
}: {
  value: ReactNode;
  label: string;
}) {
  return (
    <div>
      <span className="block text-2xl font-bold tracking-tight text-ink tnum sm:text-3xl">
        {value}
      </span>
      <span className="mt-1 block text-xs leading-snug text-ink-3">{label}</span>
    </div>
  );
}
