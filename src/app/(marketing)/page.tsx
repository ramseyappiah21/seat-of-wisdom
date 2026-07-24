import {
  ContentWrap,
  ExploreCard,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(105deg, rgba(6,38,72,0.92) 0%, rgba(11,61,122,0.72) 48%, rgba(0,173,239,0.35) 100%), url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="grain absolute inset-0" />
        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.28em] text-cyan-soft sm:text-sm">
            {SCHOOL.name} · {SCHOOL.location}
          </p>
          <h1 className="animate-rise delay-1 mt-4 max-w-3xl font-display text-4xl leading-[1.08] text-paper sm:text-5xl lg:text-6xl">
            Welcome to Seat of Wisdom School
          </h1>
          <p className="animate-rise delay-2 mt-5 max-w-xl text-base leading-relaxed text-sky sm:text-lg">
            A caring basic school in Afrancho, Kumasi — Nursery through JHS,
            where every child is guided with excellence and heart.
          </p>
          <div className="animate-rise delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/admissions"
              className="rounded-xl bg-cyan px-6 py-3 text-sm font-semibold text-navy-deep transition hover:bg-cyan-soft"
            >
              Enquire online
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-paper backdrop-blur transition hover:bg-white/18"
            >
              Schedule a visit
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-white/60">
        <ContentWrap>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <SectionHeading
              eyebrow="About us"
              title={SCHOOL.tagline}
              description={`${SCHOOL.name} serves families in ${SCHOOL.area}, Kumasi with a child-friendly environment grounded in hard work, respect, and teamwork.`}
            />
            <div className="animate-rise delay-1 space-y-4">
              <p className="text-clay leading-relaxed">
                From Nursery and Kindergarten through Primary and Junior High,
                our teachers walk with every pupil — academically, morally, and
                socially — so they leave ready for the next stage of learning.
              </p>
              <Link
                href="/about"
                className="inline-flex text-sm font-semibold text-blue transition hover:text-navy"
              >
                About Seat of Wisdom →
              </Link>
            </div>
          </div>
        </ContentWrap>
      </section>

      <section>
        <ContentWrap>
          <SectionHeading
            eyebrow="Explore"
            title="Engage. Learn. Connect."
            description="Discover how we teach, what is happening on campus, and life at our Afrancho school."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <ExploreCard
              href="/academics"
              title="Academics"
              description="GES-aligned pathways from Nursery to JHS — inquiry, creativity, and strong foundations."
              cta="Explore academics"
            />
            <ExploreCard
              href="/news"
              title="Updates"
              description="School programmes, celebrations, and term news from our Kumasi community."
              cta="View updates"
            />
            <ExploreCard
              href="/about"
              title="Our campus"
              description="A welcoming learning environment for pupils and families in Afrancho."
              cta="Learn more"
            />
          </div>
        </ContentWrap>
      </section>

      <section className="bg-navy text-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-soft">
              Admissions
            </p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">
              {SCHOOL.tagline}
            </h2>
            <p className="mt-2 max-w-xl text-sky">
              Now accepting applications for the {SCHOOL.academicYear} academic
              year.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admissions"
              className="rounded-xl bg-cyan px-5 py-3 text-sm font-semibold text-navy-deep transition hover:bg-cyan-soft"
            >
              Enquire online
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-paper transition hover:bg-white/10"
            >
              Schedule a visit
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)]">
        <ContentWrap>
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--line)] bg-mist/80 px-6 py-8 sm:flex-row sm:items-center sm:px-8">
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">
                Explore. Engage. Connect.
              </h2>
              <p className="mt-2 text-clay">
                Come and see learning life at Seat of Wisdom School, Afrancho.
              </p>
            </div>
            <Link
              href="/contact"
              className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-paper transition hover:bg-navy-deep"
            >
              Schedule a visit
            </Link>
          </div>
        </ContentWrap>
      </section>
    </div>
  );
}
