"use client";

import { BrandMark } from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";
import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "Updates" },
  { href: "/contact", label: "Contact" },
  { href: "/portal", label: "Portals" },
];

export function SiteFooter() {
  const { config } = useSiteConfig();

  return (
    <footer className="bg-navy-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark tone="light" size="sm" />
            <div>
              <p className="font-display text-xl leading-tight">{config.name}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-cyan-soft">
                {config.type} · {config.location}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-sky">
            {config.tagline}. A nurturing learning community for Nursery through
            Junior High School.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-soft">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-sky">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-soft">
            Visit us
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-sky">
            <li className="leading-relaxed">{config.address}</li>
            <li>
              <a
                href={`tel:${config.phone.replace(/\s/g, "")}`}
                className="transition hover:text-paper"
              >
                {config.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${config.email}`}
                className="transition hover:text-paper"
              >
                {config.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-sky/90 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {config.name}. Academic year{" "}
            {config.academicYear}.
          </p>
          <p>
            {config.district} · {config.region}
          </p>
        </div>
      </div>
    </footer>
  );
}
