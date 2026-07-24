import { ContactForm } from "@/components/marketing/ContactForm";
import {
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";

const steps = [
  "Complete an online enquiry or visit the school office.",
  "Submit the child's birth certificate and recent passport photograph.",
  "Share previous school report (where applicable).",
  "Attend an assessment / interview as scheduled.",
  "Receive an offer and complete fee payment to confirm the place.",
];

const docs = [
  "Birth certificate or baptismal extract",
  "Two passport-size photographs",
  "Last school report (Primary / JHS transfers)",
  "Parent / guardian Ghana Card or ID",
];

export default function AdmissionsPage() {
  return (
    <div>
      <PageHero
        eyebrow={`Admissions · ${SCHOOL.academicYear}`}
        title="Join the Seat of Wisdom family"
        description="Deciding on the right school is an important choice. We welcome new families into our Afrancho community with open arms."
      />

      <ContentWrap>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              title="How to join us"
              description="A clear pathway from first enquiry to first day of school."
            />
            <ol className="mt-10 space-y-0 border-t border-[var(--line)]">
              {steps.map((step, i) => (
                <li
                  key={step}
                  className="flex gap-5 border-b border-[var(--line)] py-5"
                >
                  <span className="font-display text-2xl text-cyan tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1 text-sm leading-relaxed text-ink sm:text-base">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-12">
              <h3 className="font-display text-xl text-ink">
                Documents required
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-clay">
                {docs.map((d) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-clay">
                Questions? Email{" "}
                <a
                  className="font-semibold text-navy hover:underline"
                  href={`mailto:${SCHOOL.admissionsEmail}`}
                >
                  {SCHOOL.admissionsEmail}
                </a>{" "}
                or call {SCHOOL.phone}.
              </p>
            </div>
          </div>

          <ContactForm mode="enquire" />
        </div>
      </ContentWrap>
    </div>
  );
}
