import Link from "next/link";
import { SCHOOL } from "@/lib/types";

export default function StudentPortalHome() {
  return (
    <div className="min-h-[70vh]">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/portal"
          className="text-sm font-semibold text-navy hover:underline"
        >
          ← All portals
        </Link>
        <h1 className="font-display mt-4 text-4xl text-ink">Student portal</h1>
        <p className="mt-3 max-w-2xl text-clay">
          Select your section at {SCHOOL.name}, then choose your class to sign
          in.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Link
            href="/portal/student/primary"
            className="rounded-2xl border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
              Basic school
            </p>
            <h2 className="font-display mt-3 text-2xl text-ink">
              Primary School
            </h2>
            <p className="mt-2 text-sm text-clay">Primary 1 – Primary 6</p>
          </Link>

          <Link
            href="/portal/student/jhs"
            className="rounded-2xl border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
              Basic school
            </p>
            <h2 className="font-display mt-3 text-2xl text-ink">Junior High</h2>
            <p className="mt-2 text-sm text-clay">JHS 1 – JHS 3</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
