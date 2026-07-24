"use client";

import { Badge, PageHeader, StatCard, btnSecondary } from "@/components/ui";
import { useSchool } from "@/lib/store";
import { formatCurrency, formatDate, fullName } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const {
    students,
    teachers,
    attendance,
    results,
    fees,
    ready,
    resetData,
  } = useSchool();

  if (!ready) {
    return <p className="text-clay">Loading school records…</p>;
  }

  const activeStudents = students.filter((s) => s.status === "Active").length;
  const activeTeachers = teachers.filter((t) => t.status === "Active").length;
  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todayAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const attendanceRate =
    todayAttendance.length === 0
      ? "—"
      : `${Math.round((presentToday / todayAttendance.length) * 100)}%`;

  const outstanding = fees
    .filter((f) => f.status !== "Paid")
    .reduce((sum, f) => sum + (f.amount - f.amountPaid), 0);

  const collected = fees.reduce((sum, f) => sum + f.amountPaid, 0);
  const overdueFees = fees.filter((f) => f.status === "Overdue").length;
  const recentResults = [...results].slice(0, 5);
  const recentFees = [...fees]
    .sort((a, b) => (b.lastPaymentDate ?? b.dueDate).localeCompare(a.lastPaymentDate ?? a.dueDate))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A living snapshot of Seat of Wisdom School, Afrancho — enrollment, presence, learning, and finance."
        action={
          <button type="button" className={btnSecondary} onClick={resetData}>
            Reset demo data
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active pupils" value={activeStudents} hint={`${students.length} total enrolled`} />
        <StatCard label="Active teachers" value={activeTeachers} hint={`${teachers.length} on staff`} tone="gold" />
        <StatCard label="Today's presence" value={attendanceRate} hint={`${todayAttendance.length} marked today`} tone="ok" />
        <StatCard label="Fees outstanding" value={formatCurrency(outstanding)} hint={`${formatCurrency(collected)} collected`} tone="warn" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="surface rounded-2xl p-5 animate-rise delay-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Recent results</h2>
            <Link href="/results" className="text-sm font-semibold text-moss hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentResults.map((r) => {
              const student = students.find((s) => s.id === r.studentId);
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white/50 px-3 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {student ? fullName(student.firstName, student.lastName) : "Unknown"}
                    </p>
                    <p className="text-sm text-clay">
                      {r.subject} · {r.classLevel}
                    </p>
                  </div>
                  <Badge tone={Number(r.grade) <= 3 ? "ok" : Number(r.grade) >= 7 ? "danger" : "forest"}>
                    {r.grade} · {r.caScore + r.examScore}
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface rounded-2xl p-5 animate-rise delay-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">Fee activity</h2>
            <Link href="/fees" className="text-sm font-semibold text-moss hover:underline">
              Manage fees
            </Link>
          </div>
          <div className="mb-4 rounded-xl bg-forest/5 px-3 py-2 text-sm text-forest">
            {overdueFees} overdue invoice{overdueFees === 1 ? "" : "s"} need attention
          </div>
          <div className="space-y-3">
            {recentFees.map((f) => {
              const student = students.find((s) => s.id === f.studentId);
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white/50 px-3 py-3"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {student ? fullName(student.firstName, student.lastName) : "Unknown"}
                    </p>
                    <p className="text-sm text-clay">
                      {f.description} · due {formatDate(f.dueDate)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      f.status === "Paid"
                        ? "ok"
                        : f.status === "Overdue"
                          ? "danger"
                          : f.status === "Partial"
                            ? "warn"
                            : "neutral"
                    }
                  >
                    {f.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="surface mt-6 rounded-2xl p-5 animate-rise delay-3">
        <h2 className="font-display text-xl text-ink">Quick links</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/students", label: "Add or edit pupils" },
            { href: "/attendance", label: "Mark today's attendance" },
            { href: "/results", label: "Enter term scores" },
            { href: "/fees", label: "Record fee payments" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-4 text-sm font-semibold text-forest transition hover:border-moss hover:bg-sage"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
