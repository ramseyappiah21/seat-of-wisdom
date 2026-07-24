import {
  AdmissionsBand,
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";

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
        title="Training tomorrow’s leaders today"
        description="A Ghana Education Service–aligned programme that balances academic rigor with inquiry, creativity, and character."
      />

      <ContentWrap>
        <SectionHeading
          title="Our learning pathways"
          description="From Nursery through Junior High School, every stage builds confidently on the last."
        />

        <div className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {stages.map((stage) => (
            <article
              key={stage.title}
              className="grid gap-3 py-8 sm:grid-cols-[10rem_1fr] sm:gap-10"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  {stage.ages}
                </p>
                <h3 className="font-display mt-2 text-2xl text-ink">
                  {stage.title}
                </h3>
              </div>
              <p className="text-base leading-relaxed text-clay sm:pt-6">
                {stage.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl text-ink">
            Excellence in education is our essence
          </h2>
          <p className="mt-4 text-base leading-relaxed text-clay">
            Class exercises, continuous assessment, and end-of-term exams help us
            track growth. Subjects include English, Mathematics, Integrated
            Science, Social Studies, Asante Twi, RME, Creative Arts, and
            Computing — prepared for academic year {SCHOOL.academicYear}.
          </p>
        </div>
      </ContentWrap>

      <AdmissionsBand />
    </div>
  );
}
