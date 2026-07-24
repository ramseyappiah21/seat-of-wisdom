import { SCHOOL } from "@/lib/types";
import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "Updates" },
  { href: "/contact", label: "Contact" },
  { href: "/portal", label: "Portals" },
  { href: "/dashboard", label: "Staff office" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-navy-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-soft">
            {SCHOOL.type}
          </p>
          <p className="font-display mt-2 text-2xl">{SCHOOL.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-sky">
            {SCHOOL.tagline}. A nurturing basic school community in{" "}
            {SCHOOL.area}, Kumasi.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-cyan-soft">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-sky">
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
          <p className="text-sm font-semibold text-cyan-soft">Visit us</p>
          <ul className="mt-3 space-y-2 text-sm text-sky">
            <li>{SCHOOL.address}</li>
            <li>
              <a href={`tel:${SCHOOL.phone.replace(/\s/g, "")}`} className="hover:text-paper">
                {SCHOOL.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SCHOOL.email}`} className="hover:text-paper">
                {SCHOOL.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-sky sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SCHOOL.name}. Academic year{" "}
            {SCHOOL.academicYear}.
          </p>
          <p>
            {SCHOOL.district} · {SCHOOL.region}
          </p>
        </div>
      </div>
    </footer>
  );
}
