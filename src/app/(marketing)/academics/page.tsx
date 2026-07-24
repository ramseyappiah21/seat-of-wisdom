import {
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";
import Link from "next/link";

const stages = [
  {
    title: "Nursery",
    ages: "Early years",
    text: "Play-based foundations in language, number sense, and social skills in a warm, guided setting.",
  },
  {
    title: "Kindergarten",
    ages: "KG 1 – KG 2",
    text: "Ready-for-primary learning through stories, creative arts, outdoor play, and early literacy.",
  },
  {
    title: "Primary",
    ages: "Primary 1 – 6",
    text: "Strong literacy and numeracy, Our World Our People, Creative Arts, Computing, and Asante Twi.",
  },
  {
    title: "Junior High",
    ages: "JHS 1 – 3",
    text: "Integrated Science, Social Studies, Career Technology, and preparation toward BECE.",
  },
];

export default function AcademicsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Academics"
        title="Training tomorrow's leaders today"
        description="A Ghana Education Service–aligned programme that balances academic rigor with inquiry, creativity, and character."
      />

      <ContentWrap>
        <SectionHeading
          title="Our learning pathways"
          description="From Nursery through Junior High School, every stage builds confidently on the last."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {stages.map((stage) => (
            <article
              key={stage.title}
              className="rounded-2xl border border-[var(--line)] bg-white/70 p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                {stage.ages}
              </p>
              <h3 className="font-display mt-2 text-2xl text-ink">{stage.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-clay">{stage.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-forest px-6 py-10 text-paper sm:px-10">
          <h2 className="font-display text-3xl">Excellence in education is our essence</h2>
          <p className="mt-3 max-w-2xl text-sage leading-relaxed">
            Class exercises, continuous assessment, and end-of-term exams help us
            track growth. Subjects include English, Mathematics, Integrated
            Science, Social Studies, Asante Twi, RME, Creative Arts, and Computing.
          </p>
          <Link
            href="/admissions"
            className="mt-6 inline-flex rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-forest-deep transition hover:bg-gold-soft"
          >
            Apply for {SCHOOL.academicYear}
          </Link>
        </div>
      </ContentWrap>
    </div>
  );
}
