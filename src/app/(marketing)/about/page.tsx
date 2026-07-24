import {
  AdmissionsBand,
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
        eyebrow={`${SCHOOL.location} · ${SCHOOL.country}`}
        title={SCHOOL.name}
        description="A basic school committed to educating and developing the young people entrusted to our care."
      />

      <ContentWrap>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            eyebrow="Our story"
            title="Rooted in Afrancho, growing with every child"
            description={`We serve families across ${SCHOOL.district} with quality Nursery, Kindergarten, Primary, and Junior High education.`}
          />
          <div className="space-y-5 text-base leading-relaxed text-clay">
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
            <p className="font-display text-xl text-navy">Akwaaba.</p>
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-[var(--line)] pt-14 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue">
              Mission
            </p>
            <p className="mt-4 text-base leading-relaxed text-clay">
              To provide quality, inclusive, and holistic basic education that
              meets the aspirations of our learners — raising a generation who
              are productive citizens of Ghana and the world.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue">
              Vision
            </p>
            <p className="mt-4 text-base leading-relaxed text-clay">
              To be a leading basic school in Afrancho, Kumasi, modelling care,
              academic strength, and character for every pupil we serve.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <SectionHeading title="Our values" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="border-l-2 border-cyan pl-5">
                <h3 className="font-display text-xl text-ink">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-clay">{v.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/academics" className="btn-navy">
            Explore academics
          </Link>
          <Link href="/admissions" className="btn-outline">
            Enquire online
          </Link>
        </div>
      </ContentWrap>

      <AdmissionsBand />
    </div>
  );
}
