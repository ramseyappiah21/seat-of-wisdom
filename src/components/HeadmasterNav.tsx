"use client";

import Link from "next/link";

const tabs = [
  { href: "/portal/headmaster", label: "Classes", match: "classes" },
  { href: "/portal/headmaster/pupils", label: "All pupils", match: "pupils" },
  { href: "/portal/headmaster/assign", label: "Assign teachers", match: "assign" },
] as const;

export function HeadmasterNav({
  active,
}: {
  active: "classes" | "pupils" | "assign";
}) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 text-sm">
      {tabs.map((tab) =>
        tab.match === active ? (
          <span
            key={tab.href}
            className="rounded-lg bg-navy px-3 py-1.5 font-semibold text-paper"
          >
            {tab.label}
          </span>
        ) : (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 font-semibold text-navy hover:bg-sky/40"
          >
            {tab.label}
          </Link>
        )
      )}
    </nav>
  );
}
