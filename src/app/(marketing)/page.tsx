import {
  AdmissionsBand,
  ContentWrap,
  ExploreLink,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";
import Link from "next/link";

const values = [
  { title: "Hard work", text: "Every pupil is encouraged to give their best." },
  { title: "Respect", text: "We honour pupils, teachers, and families alike." },
  {
    title: "Care",
    text: "A safe, welcoming place where young learners thrive.",
  },
  {
    title: "Teamwork",
    text: "Teachers and parents growing each child together.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-mist">
      <PageHero
        eyebrow={`${SCHOOL.location} · ${SCHOOL.country}`}
        title={SCHOOL.shortName}
        description={`${SCHOOL.tagline}. A caring basic school in Afrancho — Nursery through JHS.`}
      />

      <div className="border-b border-[var(--line)] bg-mist px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-3">
          <Link href="/admissions" className="btn-cyan">
            Enquire online
          </Link>
          <Link href="/contact" className="btn-outline">
            Schedule a visit
          </Link>
          <Link href="/portal" className="btn-navy">
            School portals
          </Link>
        </div>
      </div>

      <section className="border-b border-[var(--line)] bg-mist">
        <ContentWrap>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow="About us"
              title="Excellence in education is our essence"
              description={`${SCHOOL.name} serves families in ${SCHOOL.area} with a child-friendly environment grounded in hard work, respect, and teamwork.`}
            />
            <div>
              <p className="leading-relaxed text-clay">
                From Nursery and Kindergarten through Primary and Junior High,
                our teachers walk with every pupil — academically, morally, and
                socially — so they leave ready for the next stage of learning.
              </p>
              <Link
                href="/about"
                className="mt-5 inline-flex text-sm font-semibold text-blue transition hover:text-navy"
              >
                About Seat of Wisdom →
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-8 border-t border-[var(--line)] pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title}>
                <p className="font-display text-xl text-ink">{v.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-clay">{v.text}</p>
              </div>
            ))}
          </div>
        </ContentWrap>
      </section>

      <section className="bg-mist">
        <ContentWrap>
          <SectionHeading
            eyebrow="Explore"
            title="Life at our Afrancho campus"
            description="Learn how we teach, what’s happening this term, and how to join our community."
          />
          <div className="mt-10 border-t border-[var(--line)]">
            <ExploreLink
              href="/academics"
              title="Academics"
              description="GES-aligned pathways from Nursery to JHS — inquiry, creativity, and strong foundations."
              cta="Explore academics"
            />
            <ExploreLink
              href="/news"
              title="Updates"
              description="School programmes, celebrations, and term news from our Kumasi community."
              cta="View updates"
            />
            <ExploreLink
              href="/admissions"
              title="Admissions"
              description={`Applications open for the ${SCHOOL.academicYear} academic year.`}
              cta="Start an enquiry"
            />
          </div>
        </ContentWrap>
      </section>

      <AdmissionsBand />
    </div>
  );
}
