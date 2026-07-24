import Link from "next/link";
import { notFound } from "next/navigation";
import {
  classesForSection,
  classToSlug,
  type ClassSection,
} from "@/lib/types";

const labels: Record<ClassSection, string> = {
  primary: "Primary School",
  jhs: "Junior High School",
  early: "Nursery & KG",
};

export default async function StudentSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: raw } = await params;
  if (raw !== "primary" && raw !== "jhs") notFound();
  const section = raw as ClassSection;
  const classes = classesForSection(section);

  return (
    <div className="min-h-[70vh]">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <Link
          href="/portal/student"
          className="text-sm font-semibold text-navy hover:underline"
        >
          ← Student portal
        </Link>
        <h1 className="font-display mt-4 text-4xl text-ink">{labels[section]}</h1>
        <p className="mt-3 text-clay">Choose your class to continue to login.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {classes.map((level) => (
            <Link
              key={level}
              href={`/portal/student/${section}/${classToSlug(level)}`}
              className="rounded-xl border border-[var(--line)] bg-white/90 px-5 py-6 text-center font-display text-xl text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-cyan hover:shadow-md"
            >
              {level}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
