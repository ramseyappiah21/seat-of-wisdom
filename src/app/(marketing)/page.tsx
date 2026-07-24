"use client";

import {
  AdmissionsBand,
  ContentWrap,
  ExploreLink,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";
import Link from "next/link";

export default function HomePage() {
  const { config } = useSiteConfig();
  const m = config.marketing;

  return (
    <div className="bg-mist">
      <PageHero
        eyebrow={`${config.location} · ${config.country}`}
        title={config.shortName}
        description={`${config.tagline}. ${m.homeHeroSupport}`}
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
              title={m.homeAboutTitle}
              description={`${config.name} ${m.homeAboutBlurb}`}
            />
            <div>
              <p className="leading-relaxed text-clay">{m.aboutStoryBody1}</p>
              <Link
                href="/about"
                className="mt-5 inline-flex text-sm font-semibold text-blue transition hover:text-navy"
              >
                About {config.shortName} →
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-8 border-t border-[var(--line)] pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {m.values.map((v) => (
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
            title={m.homeExploreTitle}
            description={m.homeExploreBlurb}
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
              description="School programmes, celebrations, and term news from our community."
              cta="View updates"
            />
            <ExploreLink
              href="/admissions"
              title="Admissions"
              description={`Applications open for the ${config.academicYear} academic year.`}
              cta="Start an enquiry"
            />
          </div>
        </ContentWrap>
      </section>

      <AdmissionsBand />
    </div>
  );
}
