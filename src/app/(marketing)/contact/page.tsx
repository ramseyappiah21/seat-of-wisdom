"use client";

import { ContactForm } from "@/components/marketing/ContactForm";
import {
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";

export default function ContactPage() {
  const { config } = useSiteConfig();
  const m = config.marketing;

  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title={m.contactHeroTitle}
        description={m.contactHeroDescription}
      />

      <ContentWrap>
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading title="School office" />
            <dl className="mt-10 space-y-8 border-t border-[var(--line)] pt-8 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Campus address
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-clay">
                  {config.address}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Phone / WhatsApp
                </dt>
                <dd className="mt-2 text-base text-clay">
                  <a
                    href={`tel:${config.phone.replace(/\s/g, "")}`}
                    className="transition hover:text-navy"
                  >
                    {config.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  General enquiries
                </dt>
                <dd className="mt-2 text-base text-clay">
                  <a
                    href={`mailto:${config.email}`}
                    className="transition hover:text-navy"
                  >
                    {config.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Admissions
                </dt>
                <dd className="mt-2 text-base text-clay">
                  <a
                    href={`mailto:${config.admissionsEmail}`}
                    className="transition hover:text-navy"
                  >
                    {config.admissionsEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Office hours
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-clay">
                  {m.officeHours}
                  <br />
                  Academic year {config.academicYear}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-8">
            <ContactForm mode="visit" />
            <ContactForm mode="message" />
          </div>
        </div>
      </ContentWrap>
    </div>
  );
}
