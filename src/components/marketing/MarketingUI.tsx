import { SCHOOL } from "@/lib/types";
import Link from "next/link";
import type { ReactNode } from "react";

export function BrandMark({
  tone = "light",
  size = "md",
}: {
  tone?: "light" | "dark";
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-9 w-9 text-sm" : "h-11 w-11 text-base";
  const ring = tone === "light" ? "bg-cyan text-navy-deep" : "bg-navy text-paper";
  return (
    <span
      className={`inline-flex ${dim} shrink-0 items-center justify-center rounded-full font-display font-semibold tracking-tight ${ring}`}
      aria-hidden
    >
      SW
    </span>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** @deprecated unused — kept for call-site compatibility */
  imageUrl?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-paper">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 12% 0%, rgba(0,173,239,0.35), transparent 50%), radial-gradient(ellipse at 100% 80%, rgba(14,90,167,0.4), transparent 45%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <p className="animate-rise text-xs font-semibold uppercase tracking-[0.26em] text-cyan-soft">
          {eyebrow}
        </p>
        <h1 className="animate-rise delay-1 mt-3 max-w-3xl font-display text-4xl leading-[1.08] sm:text-5xl">
          {title}
        </h1>
        <p className="animate-rise delay-2 mt-4 max-w-2xl text-base leading-relaxed text-sky sm:text-lg">
          {description}
        </p>
        <div className="animate-underline mt-6 h-px w-24 bg-cyan" />
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
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue">
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

export function ExploreLink({
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
      className="group block border-t border-[var(--line)] py-7 transition first:border-t-0 first:pt-0 hover:bg-mist/40 sm:py-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div>
          <h3 className="font-display text-2xl text-ink transition group-hover:text-navy sm:text-3xl">
            {title}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-clay sm:text-base">
            {description}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-blue transition group-hover:text-navy">
          {cta} →
        </span>
      </div>
    </Link>
  );
}

/** @deprecated Prefer ExploreLink for a cleaner layout */
export function ExploreCard(props: {
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return <ExploreLink {...props} />;
}

export function ContentWrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20 ${className}`}
    >
      {children}
    </div>
  );
}

export function AdmissionsBand() {
  return (
    <section className="relative overflow-hidden border-t border-b border-[var(--line)] bg-navy text-paper">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 0%, rgba(0,173,239,0.45), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(14,90,167,0.35), transparent 45%)",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-soft">
            Admissions {SCHOOL.academicYear}
          </p>
          <h2 className="font-display mt-3 max-w-xl text-3xl leading-tight sm:text-4xl">
            {SCHOOL.tagline}
          </h2>
          <p className="mt-3 max-w-lg text-sky">
            Places open for Nursery through JHS. Visit campus or enquire online.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admissions" className="btn-cyan">
            Enquire online
          </Link>
          <Link href="/contact" className="btn-ghost-light">
            Schedule a visit
          </Link>
        </div>
      </div>
    </section>
  );
}
