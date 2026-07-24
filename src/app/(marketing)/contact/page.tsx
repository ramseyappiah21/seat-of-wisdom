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
        title="Get in touch"
        description="Visit our campus in Afrancho, Kumasi, call the office, or send a message — we would love to welcome you."
      />

      <ContentWrap>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading title="Visit Seat of Wisdom" />
            <dl className="mt-8 space-y-6 text-sm">
              <div>
                <dt className="font-semibold text-forest">Campus address</dt>
                <dd className="mt-1 text-clay leading-relaxed">{SCHOOL.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-forest">Phone / WhatsApp</dt>
                <dd className="mt-1 text-clay">
                  <a
                    href={`tel:${SCHOOL.phone.replace(/\s/g, "")}`}
                    className="hover:text-forest"
                  >
                    {SCHOOL.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-forest">General enquiries</dt>
                <dd className="mt-1 text-clay">
                  <a href={`mailto:${SCHOOL.email}`} className="hover:text-forest">
                    {SCHOOL.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-forest">Admissions</dt>
                <dd className="mt-1 text-clay">
                  <a
                    href={`mailto:${SCHOOL.admissionsEmail}`}
                    className="hover:text-forest"
                  >
                    {SCHOOL.admissionsEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-forest">Office hours</dt>
                <dd className="mt-1 text-clay">
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
