import Link from "next/link";
import { SCHOOL } from "@/lib/types";

export default function PortalHubPage() {
  return (
    <div className="min-h-[70vh]">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
          {SCHOOL.name}
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">
          School portals
        </h1>
        <p className="mt-3 max-w-2xl text-clay">
          Pupils check published results by class. Subject teachers send scores
          to the class teacher, who ranks the class and releases results to
          pupils.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Link
            href="/portal/student"
            className="rounded-2xl border border-[var(--line)] bg-navy p-6 text-paper shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-soft">
              Pupils
            </p>
            <h2 className="font-display mt-3 text-2xl">Student portal</h2>
            <p className="mt-2 text-sm text-sky">
              Choose Primary or JHS, pick your class, then log in with your full
              name and password.
            </p>
          </Link>

          <Link
            href="/portal/teacher"
            className="rounded-2xl border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
              Staff
            </p>
            <h2 className="font-display mt-3 text-2xl text-ink">Teacher portal</h2>
            <p className="mt-2 text-sm text-clay">
              Enter your subject results for a class, or open your class portal
              if you are a class teacher.
            </p>
          </Link>

          <Link
            href="/portal/headmaster"
            className="rounded-2xl border border-[var(--line)] bg-white/90 p-6 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
              Admin
            </p>
            <h2 className="font-display mt-3 text-2xl text-ink">Headmaster</h2>
            <p className="mt-2 text-sm text-clay">
              See all pupils, assign each teacher to a class, and issue
              passwords.
            </p>
          </Link>
        </div>

        <p className="mt-8 text-sm text-clay">
          <Link href="/" className="font-semibold text-navy hover:underline">
            ← Back to school website
          </Link>
        </p>
      </div>
    </div>
  );
}
