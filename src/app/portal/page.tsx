import Link from "next/link";
import { SCHOOL } from "@/lib/types";

const portals = [
  {
    href: "/portal/student",
    eyebrow: "Pupils",
    title: "Student portal",
    text: "Choose Primary or JHS, pick your class, then sign in with your name and password.",
    featured: true,
  },
  {
    href: "/portal/teacher",
    eyebrow: "Staff",
    title: "Teacher portal",
    text: "Enter subject results for your classes, or open the class portal if you are a class teacher.",
    featured: false,
  },
  {
    href: "/portal/headmaster",
    eyebrow: "Admin",
    title: "Headmaster",
    text: "Manage pupils, assign teachers to classes, and issue portal passwords.",
    featured: false,
  },
];

export default function PortalHubPage() {
  return (
    <div className="min-h-[70vh]">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue">
          {SCHOOL.shortName}
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">
          School portals
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-clay">
          Pupils view published results. Subject teachers submit scores to the
          class teacher, who ranks the class and releases results.
        </p>

        <div className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {portals.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex flex-col gap-2 py-7 transition hover:bg-mist/50 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:py-8"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  {p.eyebrow}
                </p>
                <h2 className="font-display mt-2 text-2xl text-ink transition group-hover:text-navy">
                  {p.title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-clay">
                  {p.text}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-blue">
                Open →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-clay">
          <Link href="/" className="font-semibold text-navy hover:underline">
            ← Back to school website
          </Link>
        </p>
      </div>
    </div>
  );
}
