import {
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";
import Link from "next/link";

const values = [
  {
    title: "Hard work",
    text: "Every pupil is encouraged to give their best in class and beyond.",
  },
  {
    title: "Respect",
    text: "We honour one another — pupils, teachers, and families alike.",
  },
  {
    title: "Child-friendly care",
    text: "A safe, welcoming environment where young learners can thrive.",
  },
  {
    title: "Teamwork",
    text: "Teachers, staff, and parents work together for each child's growth.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="About us"
        title={`About ${SCHOOL.shortName}`}
        description={`${SCHOOL.name} is a basic school in ${SCHOOL.area}, Kumasi, committed to educating and developing the young people entrusted to our care.`}
      />

      <ContentWrap>
        <div className="grid gap-10 lg:grid-cols-2">
          <SectionHeading
            title="Our story"
            description={`Rooted in ${SCHOOL.location}, we serve families across ${SCHOOL.district} with quality Nursery, Kindergarten, Primary, and Junior High education.`}
          />
          <div className="space-y-4 text-clay leading-relaxed">
            <p>
              Excellence in education is our essence. We provide the resources
              for academic rigor alongside inquiry, creativity, and initiative —
              so every learner grows into a well-rounded young person.
            </p>
            <p>
              Our campus community values hard work, mutual respect, and a
              child-friendly atmosphere. We welcome all who share our commitment
              to personal development, responsibility, and service.
            </p>
            <p className="font-medium text-forest">Akwaaba.</p>
          </div>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
              Mission
            </p>
            <p className="mt-3 text-clay leading-relaxed">
              To provide quality, inclusive, and holistic basic education that
              meets the aspirations of our learners — raising a generation who
              are productive citizens of Ghana and the world.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
              Vision
            </p>
            <p className="mt-3 text-clay leading-relaxed">
              To be a leading basic school in Afrancho, Kumasi, modelling care,
              academic strength, and character for every pupil we serve.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading title="Our values" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-[var(--line)] bg-mist/60 px-5 py-5"
              >
                <h3 className="font-display text-xl text-ink">{v.title}</h3>
                <p className="mt-2 text-sm text-clay">{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link
            href="/academics"
            className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
          >
            Explore academics
          </Link>
          <Link
            href="/admissions"
            className="rounded-xl border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-semibold text-forest transition hover:bg-sage"
          >
            Enquire online
          </Link>
        </div>
      </ContentWrap>
    </div>
  );
}
