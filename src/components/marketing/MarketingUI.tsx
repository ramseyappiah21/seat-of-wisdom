import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--line)] bg-navy text-paper">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,173,239,0.55) 0%, rgba(11,61,122,0.2) 55%, rgba(6,38,72,0.6) 100%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="animate-rise text-xs font-semibold uppercase tracking-[0.24em] text-cyan-soft">
          {eyebrow}
        </p>
        <h1 className="animate-rise delay-1 mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="animate-rise delay-2 mt-4 max-w-2xl text-base leading-relaxed text-sky sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moss">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display mt-2 text-3xl text-ink sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-clay">{description}</p>
      ) : null}
    </div>
  );
}

export function ExploreCard({
  href,
  title,
  description,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl border border-[var(--line)] bg-navy p-6 text-paper shadow-[var(--shadow)] transition hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy/85 to-cyan/35 transition group-hover:via-navy/75" />
      <div className="relative">
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-sky">{description}</p>
        <span className="mt-4 inline-flex text-sm font-semibold text-cyan-soft">
          {cta} →
        </span>
      </div>
    </Link>
  );
}

export function ContentWrap({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {children}
    </div>
  );
}
