import {
  AdmissionsBand,
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";

const posts = [
  {
    date: "15 Sep 2025",
    title: "Welcome to the new academic year",
    excerpt:
      "Pupils and teachers returned for First Term with orientation for new Nursery and KG families.",
  },
  {
    date: "2 Oct 2025",
    title: "Inter-house sports day",
    excerpt:
      "Afrancho campus came alive with races, football, and cheer as houses competed in friendly spirit.",
  },
  {
    date: "20 Nov 2025",
    title: "Reading week celebration",
    excerpt:
      "Primary and JHS pupils showcased story performances and a book parade across the school.",
  },
  {
    date: "8 Dec 2025",
    title: "End-of-term awards & speech day",
    excerpt:
      "Excellence, improvement, and service awards celebrated our learners before the Christmas break.",
  },
];

export default function NewsPage() {
  return (
    <div>
      <PageHero
        eyebrow="News & events"
        title="School life at Seat of Wisdom"
        description="Programmes, celebrations, and updates from our basic school community in Afrancho, Kumasi."
      />

      <ContentWrap>
        <SectionHeading
          title="Latest from campus"
          description={`Stay connected with ${SCHOOL.shortName} throughout the ${SCHOOL.academicYear} academic year.`}
        />

        <div className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {posts.map((post) => (
            <article key={post.title} className="grid gap-3 py-8 sm:grid-cols-[9rem_1fr] sm:gap-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
                {post.date}
              </p>
              <div>
                <h3 className="font-display text-xl text-ink sm:text-2xl">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-clay sm:text-base">
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </ContentWrap>

      <AdmissionsBand />
    </div>
  );
}
