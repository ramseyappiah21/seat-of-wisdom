import {
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";
import Link from "next/link";

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
        eyebrow="News & Events"
        title="School life at Seat of Wisdom"
        description="Programmes, celebrations, and updates from our basic school community in Afrancho, Kumasi."
      />

      <ContentWrap>
        <SectionHeading
          title="Latest from campus"
          description={`Stay connected with ${SCHOOL.shortName} throughout the ${SCHOOL.academicYear} academic year.`}
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-2xl border border-[var(--line)] bg-white/70 p-6 transition hover:border-moss/40"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                {post.date}
              </p>
              <h3 className="font-display mt-2 text-xl text-ink">{post.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-clay">{post.excerpt}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-mist/50 px-6 py-8 text-center">
          <p className="font-display text-xl text-ink">Want to visit on an open day?</p>
          <p className="mt-2 text-sm text-clay">
            Schedule a campus tour and meet our teachers.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            Schedule a visit
          </Link>
        </div>
      </ContentWrap>
    </div>
  );
}
