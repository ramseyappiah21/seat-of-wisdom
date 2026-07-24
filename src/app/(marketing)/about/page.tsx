"use client";

import {
  AdmissionsBand,
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";
import Link from "next/link";

export default function AboutPage() {
  const { config } = useSiteConfig();
  const m = config.marketing;

  return (
    <div>
      <PageHero
        eyebrow={`${config.location} · ${config.country}`}
        title={config.name}
        description={m.aboutHeroDescription}
      />

      <ContentWrap>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            eyebrow="Our story"
            title={m.aboutStoryTitle}
            description={`${m.aboutStoryIntro} (${config.district}).`}
          />
          <div className="space-y-5 text-base leading-relaxed text-clay">
            <p>{m.aboutStoryBody1}</p>
            <p>{m.aboutStoryBody2}</p>
            <p className="font-display text-xl text-navy">{m.aboutWelcome}</p>
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-[var(--line)] pt-14 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue">
              Mission
            </p>
            <p className="mt-4 text-base leading-relaxed text-clay">{m.mission}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue">
              Vision
            </p>
            <p className="mt-4 text-base leading-relaxed text-clay">{m.vision}</p>
          </div>
        </div>

        <div className="mt-20">
          <SectionHeading title="Our values" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {m.values.map((v) => (
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
