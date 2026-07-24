"use client";

import {
  AdmissionsBand,
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";

export default function AcademicsPage() {
  const { config } = useSiteConfig();
  const m = config.marketing;

  return (
    <div>
      <PageHero
        eyebrow="Academics"
        title={m.academicsHeroTitle}
        description={m.academicsHeroDescription}
      />

      <ContentWrap>
        <SectionHeading
          title={m.academicsPathwaysTitle}
          description={m.academicsPathwaysBlurb}
        />

        <div className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {m.stages.map((stage) => (
            <article
              key={stage.title}
              className="grid gap-3 py-8 sm:grid-cols-[10rem_1fr] sm:gap-10"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  {stage.ages}
                </p>
                <h3 className="font-display mt-2 text-2xl text-ink">
                  {stage.title}
                </h3>
              </div>
              <p className="text-base leading-relaxed text-clay sm:pt-6">
                {stage.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl text-ink">
            {m.academicsEssenceTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-clay">
            {m.academicsEssenceBody} Prepared for academic year{" "}
            {config.academicYear}.
          </p>
        </div>
      </ContentWrap>

      <AdmissionsBand />
    </div>
  );
}
