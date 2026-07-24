import Link from "next/link";
import { SCHOOL } from "@/lib/types";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="border-b border-[var(--line)] bg-navy text-paper print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/portal" className="font-display text-lg">
            {SCHOOL.shortName} · Portals
          </Link>
          <div className="flex gap-3 text-sm">
            <Link href="/" className="text-sky hover:text-paper">
              Website
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
