import Link from "next/link";
import { SCHOOL } from "@/lib/types";

const portalCardClass =
  "rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)] transition hover:-translate-y-1 hover:shadow-lg";

const portals = [
  {
    href: "/portal/student",
    eyebrow: "Pupils",
    title: "Student portal",
    text: "Choose Primary or JHS, pick your class, then log in with your full name and password.",
  },
  {
    href: "/portal/teacher",
    eyebrow: "Staff",
    title: "Teacher portal",
    text: "Enter your subject results for a class, or open your class portal if you are a class teacher.",
  },
  {
    href: "/portal/headmaster",
    eyebrow: "Admin",
    title: "Headmaster",
    text: "See all pupils, assign each teacher to a class, and issue passwords.",
  },
] as const;

export default function PortalHubPage() {
  return (
    <div className="min-h-[70vh] bg-mist">
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
          {portals.map((p) => (
            <Link key={p.href} href={p.href} className={portalCardClass}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
                {p.eyebrow}
              </p>
              <h2 className="font-display mt-3 text-2xl text-ink">{p.title}</h2>
              <p className="mt-2 text-sm text-clay">{p.text}</p>
            </Link>
          ))}
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
