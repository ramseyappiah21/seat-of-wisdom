"use client";

import {
  AdmissionsBand,
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";

export default function NewsPage() {
  const { config } = useSiteConfig();
  const m = config.marketing;

  return (
    <div>
      <PageHero
        eyebrow="News & events"
        title={m.newsHeroTitle}
        description={m.newsHeroDescription}
      />

      <ContentWrap>
        <SectionHeading
          title={m.newsSectionTitle}
          description={`Stay connected with ${config.shortName} throughout the ${config.academicYear} academic year.`}
        />

        <div className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {m.newsPosts.map((post) => (
            <article
              key={post.title}
              className="grid gap-3 py-8 sm:grid-cols-[9rem_1fr] sm:gap-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue">
                {post.date}
              </p>
              <div>
                <h3 className="font-display text-xl text-ink sm:text-2xl">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-clay sm:text-base">
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </ContentWrap>

      <AdmissionsBand />
    </div>
  );
}
