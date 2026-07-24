"use client";

import { useSiteConfig } from "@/lib/site-config-provider";
import { cn } from "@/lib/utils";
import {
  BookOpenCheck,
  CalendarCheck2,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Receipt,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Pupils", icon: GraduationCap },
  { href: "/teachers", label: "Teachers", icon: UsersRound },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck2 },
  { href: "/results", label: "Results", icon: BookOpenCheck },
  { href: "/fees", label: "Fees", icon: Receipt },
  { href: "/portal", label: "Portals", icon: Users },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-transparent lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] border-r border-[var(--line)] bg-forest-deep text-paper transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-6">
            <Link href="/" className="group block" onClick={() => setOpen(false)}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-soft">
                {config.type} · {config.location}
              </p>
              <p className="font-display mt-2 text-2xl leading-tight text-paper transition group-hover:text-gold-soft">
                {config.shortName}
              </p>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-white/12 text-gold-soft"
                      : "text-sage hover:bg-white/8 hover:text-paper"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl bg-white/8 px-3 py-3">
              <div className="flex items-center gap-2 text-gold-soft">
                <Users size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Session
                </span>
              </div>
              <p className="mt-2 text-sm text-paper">2025 / 2026 · First Term</p>
              <p className="mt-1 text-xs text-sage">{config.area}</p>
            </div>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-paper/80 px-4 py-3 backdrop-blur-md lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-forest lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="font-display text-lg text-forest lg:hidden">
            {config.shortName}
          </p>
          <div className="hidden text-sm text-clay lg:block">
            {config.name} · {config.district}
          </div>
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-forest transition hover:bg-sage"
          >
            Home
          </Link>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
