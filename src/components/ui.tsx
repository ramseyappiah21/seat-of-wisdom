import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-rise">
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-clay">{description}</p>
        <div className="mt-3 h-0.5 w-16 origin-left bg-gold animate-underline" />
      </div>
      {action ? <div className="animate-rise delay-1">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "forest",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "forest" | "gold" | "ok" | "warn";
}) {
  const accents = {
    forest: "from-forest/10 to-transparent text-forest",
    gold: "from-gold/15 to-transparent text-gold",
    ok: "from-ok/10 to-transparent text-ok",
    warn: "from-warn/10 to-transparent text-warn",
  };

  return (
    <div className="surface relative overflow-hidden rounded-2xl p-5 animate-rise">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br",
          accents[tone]
        )}
      />
      <p className="relative text-sm font-medium uppercase tracking-[0.14em] text-clay">
        {label}
      </p>
      <p className="relative mt-3 font-display text-3xl text-ink">{value}</p>
      {hint ? <p className="relative mt-2 text-sm text-clay">{hint}</p> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "gold" | "forest";
}) {
  const styles = {
    neutral: "bg-sage text-forest",
    ok: "bg-emerald-100 text-ok",
    warn: "bg-amber-100 text-warn",
    danger: "bg-red-100 text-danger",
    gold: "bg-gold-soft/60 text-[#7a5f24]",
    forest: "bg-forest/10 text-forest",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-mist/60 px-6 py-14 text-center">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-clay">{description}</p>
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-forest">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2.5 text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-paper shadow-sm transition hover:bg-forest-deep disabled:opacity-50";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-forest transition hover:bg-sage";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-red-100";
