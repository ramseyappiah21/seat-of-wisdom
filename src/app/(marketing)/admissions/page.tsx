"use client";

import { ContactForm } from "@/components/marketing/ContactForm";
import {
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";

export default function AdmissionsPage() {
  const { config } = useSiteConfig();
  const m = config.marketing;

  return (
    <div>
      <PageHero
        eyebrow={`Admissions · ${config.academicYear}`}
        title={m.admissionsHeroTitle}
        description={m.admissionsHeroDescription}
      />

      <ContentWrap>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              title={m.admissionsStepsTitle}
              description={m.admissionsStepsBlurb}
            />
            <ol className="mt-10 space-y-0 border-t border-[var(--line)]">
              {m.admissionsSteps.map((step, i) => (
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
                {m.admissionsDocsTitle}
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-clay">
                {m.admissionsDocs.map((d) => (
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
                  href={`mailto:${config.admissionsEmail}`}
                >
                  {config.admissionsEmail}
                </a>{" "}
                or call {config.phone}.
              </p>
            </div>
          </div>

          <ContactForm mode="enquire" />
        </div>
      </ContentWrap>
    </div>
  );
}
