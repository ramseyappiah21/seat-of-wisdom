import {
  AdmissionsBand,
  ContentWrap,
  ExploreLink,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";
import Link from "next/link";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2200&q=80";

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
    <div>
      <section className="relative min-h-[88vh] overflow-hidden">
        <div
          className="animate-ken absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(108deg, rgba(6,38,72,0.93) 0%, rgba(11,61,122,0.7) 46%, rgba(0,173,239,0.32) 100%), url('${HERO_IMAGE}')`,
          }}
        />
        <div className="grain absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <p className="animate-rise font-display text-4xl leading-[1.05] text-paper sm:text-5xl md:text-6xl lg:text-7xl">
            {SCHOOL.shortName}
          </p>
          <h1 className="animate-rise delay-1 mt-4 max-w-2xl text-lg font-medium leading-snug text-cyan-soft sm:text-xl md:text-2xl">
            {SCHOOL.tagline}
          </h1>
          <p className="animate-rise delay-2 mt-4 max-w-lg text-base leading-relaxed text-sky sm:text-lg">
            A caring basic school in Afrancho, Kumasi — Nursery through JHS.
          </p>
          <div className="animate-rise delay-3 mt-9 flex flex-wrap gap-3">
            <Link href="/admissions" className="btn-cyan">
              Enquire online
            </Link>
            <Link href="/contact" className="btn-ghost-light">
              Schedule a visit
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-white/70">
        <ContentWrap>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              eyebrow="About us"
              title={`Excellence in education is our essence`}
              description={`${SCHOOL.name} serves families in ${SCHOOL.area} with a child-friendly environment grounded in hard work, respect, and teamwork.`}
            />
            <div className="animate-rise delay-1">
              <p className="text-clay leading-relaxed">
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
              <div key={v.title} className="animate-rise">
                <p className="font-display text-xl text-ink">{v.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-clay">{v.text}</p>
              </div>
            ))}
          </div>
        </ContentWrap>
      </section>

      <section>
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
