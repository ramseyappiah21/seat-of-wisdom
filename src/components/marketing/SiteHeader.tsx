"use client";

import { SCHOOL } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "Updates" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar — matches seatofwisdomschool.com.free cyan strip */}
      <div className="bg-cyan text-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href={`tel:${SCHOOL.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 hover:opacity-90"
            >
              <Phone size={13} />
              {SCHOOL.phone}
            </a>
            <a
              href={`mailto:${SCHOOL.email}`}
              className="inline-flex items-center gap-1.5 hover:opacity-90"
            >
              <Mail size={13} />
              {SCHOOL.email}
            </a>
          </div>
          <p className="inline-flex items-center gap-1.5 font-medium">
            <MapPin size={13} />
            {SCHOOL.name}, {SCHOOL.location}, {SCHOOL.region}, {SCHOOL.country}
          </p>
          <Link
            href="/admissions"
            className="hidden rounded-md bg-navy px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-paper transition hover:bg-navy-deep lg:inline-flex"
          >
            Enquiry
          </Link>
        </div>
      </div>

      <div className="border-b border-[var(--line)] bg-navy text-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0" onClick={() => setOpen(false)}>
            <p className="font-display text-lg leading-tight sm:text-xl">
              {SCHOOL.name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-soft sm:text-xs">
              {SCHOOL.location}
            </p>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                pathname === "/"
                  ? "bg-white/15 text-paper"
                  : "text-sky hover:bg-white/10 hover:text-paper"
              )}
            >
              Home
            </Link>
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-white/15 text-paper"
                      : "text-sky hover:bg-white/10 hover:text-paper"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/portal"
              className="ml-2 rounded-md bg-cyan px-3 py-2 text-sm font-semibold text-navy-deep transition hover:bg-cyan-soft"
            >
              Portals
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-cyan-soft transition hover:text-paper"
            >
              Staff office
            </Link>
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
                className="rounded-xl px-3 py-3 text-sm font-medium text-paper hover:bg-white/10"
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
                    pathname === link.href
                      ? "bg-white/15 text-paper"
                      : "text-sky hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            <Link
              href="/portal"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-cyan px-3 py-3 text-center text-sm font-semibold text-navy-deep"
            >
              Portals
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-center text-sm font-medium text-cyan-soft"
            >
              Staff office
            </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
