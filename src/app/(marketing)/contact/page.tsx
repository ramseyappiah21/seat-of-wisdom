import { ContactForm } from "@/components/marketing/ContactForm";
import {
  ContentWrap,
  PageHero,
  SectionHeading,
} from "@/components/marketing/MarketingUI";
import { SCHOOL } from "@/lib/types";

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="Visit us in Afrancho"
        description="Call the office, send a message, or schedule a campus tour — we would love to welcome you."
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
                  {SCHOOL.address}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Phone / WhatsApp
                </dt>
                <dd className="mt-2 text-base text-clay">
                  <a
                    href={`tel:${SCHOOL.phone.replace(/\s/g, "")}`}
                    className="transition hover:text-navy"
                  >
                    {SCHOOL.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  General enquiries
                </dt>
                <dd className="mt-2 text-base text-clay">
                  <a
                    href={`mailto:${SCHOOL.email}`}
                    className="transition hover:text-navy"
                  >
                    {SCHOOL.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Admissions
                </dt>
                <dd className="mt-2 text-base text-clay">
                  <a
                    href={`mailto:${SCHOOL.admissionsEmail}`}
                    className="transition hover:text-navy"
                  >
                    {SCHOOL.admissionsEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                  Office hours
                </dt>
                <dd className="mt-2 text-base leading-relaxed text-clay">
                  Monday – Friday, 8:00am – 4:00pm
                  <br />
                  Academic year {SCHOOL.academicYear}
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
