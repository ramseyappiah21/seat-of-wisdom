"use client";

import { BrandMark } from "@/components/marketing/MarketingUI";
import { useSiteConfig } from "@/lib/site-config-provider";
import { cn } from "@/lib/utils";
import { Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "Updates" },
  { href: "/contact", label: "Contact" },
  { href: "/portal", label: "Portals" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { config } = useSiteConfig();

  function navClass(href: string) {
    const active =
      href === "/portal"
        ? pathname.startsWith("/portal")
        : pathname === href;
    return cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition",
      active
        ? "bg-white/12 text-paper"
        : "text-sky hover:bg-white/10 hover:text-paper"
    );
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy-deep text-sky">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8 sm:text-[13px]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a
              href={`tel:${config.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 transition hover:text-paper"
            >
              <Phone size={12} />
              {config.phone}
            </a>
            <a
              href={`mailto:${config.email}`}
              className="inline-flex items-center gap-1.5 transition hover:text-paper"
            >
              <Mail size={12} />
              {config.email}
            </a>
          </div>
          <p className="hidden text-cyan-soft sm:block">
            {config.marketing.headerLocationLabel || config.location}
          </p>
        </div>
      </div>

      <div className="border-b border-white/10 bg-navy/95 text-paper backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <BrandMark tone="light" size="sm" />
            <span className="min-w-0">
              <span className="block font-display text-lg leading-tight sm:text-xl">
                {config.shortName}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-cyan-soft sm:text-[11px]">
                {config.brand.navSubtitle}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            <Link href="/" className={navClass("/")}>
              Home
            </Link>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-paper lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-white/10 bg-navy-deep px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-3 text-sm font-medium",
                  pathname === "/"
                    ? "bg-white/12 text-paper"
                    : "text-sky hover:bg-white/10"
                )}
              >
                Home
              </Link>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm font-medium",
                    (
                      link.href === "/portal"
                        ? pathname.startsWith("/portal")
                        : pathname === link.href
                    )
                      ? "bg-white/12 text-paper"
                      : "text-sky hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
