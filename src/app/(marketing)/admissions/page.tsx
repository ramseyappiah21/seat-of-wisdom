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
        eyebrow="Admissions"
        title={`Now accepting applications for ${SCHOOL.academicYear}`}
        description="Deciding on the right school is an important choice. We welcome new families with open arms into our Bronkong community."
      />

      <ContentWrap>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              title="How to join us"
              description="A clear pathway from first enquiry to first day of school."
            />
            <ol className="mt-8 space-y-4">
              {steps.map((step, i) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-xl border border-[var(--line)] bg-white/60 px-4 py-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-paper">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink pt-1">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <h3 className="font-display text-xl text-ink">Documents required</h3>
              <ul className="mt-4 space-y-2 text-sm text-clay">
                {docs.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-moss">•</span>
                    {d}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-clay">
                Questions? Email{" "}
                <a
                  className="font-semibold text-forest hover:underline"
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
