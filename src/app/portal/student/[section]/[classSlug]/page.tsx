"use client";

import { Badge, Field, btnPrimary, btnSecondary, inputClass } from "@/components/ui";
import {
  clearStudentSession,
  getStudentSession,
  saveStudentSession,
} from "@/lib/portal-auth";
import { useSiteConfig } from "@/lib/site-config-provider";
import { useSchool } from "@/lib/store";
import {
  classesForSection,
  slugToClass,
  type ClassLevel,
  type ClassSection,
} from "@/lib/types";
import { fullName, totalScore } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function StudentClassPortalPage() {
  const params = useParams<{ section: string; classSlug: string }>();
  const router = useRouter();
  const { config } = useSiteConfig();
  const { students, results, ready, authenticateStudent, updateStudent } =
    useSchool();

  const section = params.section as ClassSection;
  const classLevel = slugToClass(params.classSlug ?? "");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    const session = getStudentSession();
    if (
      session &&
      classLevel &&
      session.classLevel === classLevel
    ) {
      setStudentId(session.studentId);
    }
  }, [classLevel]);

  const student = useMemo(
    () => students.find((s) => s.id === studentId) ?? null,
    [students, studentId]
  );

  const myResults = useMemo(() => {
    if (!student) return [];
    return results.filter((r) => r.studentId === student.id && r.published);
  }, [results, student]);

  const publishedStandings = useMemo(() => {
    const groups = new Map<
      string,
      { term: string; session: string; rank?: number; total: number; subjects: number }
    >();
    for (const r of myResults) {
      const key = `${r.term}|${r.session}`;
      const prev = groups.get(key) ?? {
        term: r.term,
        session: r.session,
        rank: r.classRank,
        total: 0,
        subjects: 0,
      };
      prev.total += totalScore(r);
      prev.subjects += 1;
      prev.rank = r.classRank ?? prev.rank;
      groups.set(key, prev);
    }
    return [...groups.values()];
  }, [myResults]);

  if (!ready) return <p className="p-8 text-clay">Loading…</p>;

  if (
    (section !== "primary" && section !== "jhs") ||
    !classLevel ||
    !classesForSection(section).includes(classLevel)
  ) {
    return (
      <div className="p-8">
        <p className="text-clay">Class not found.</p>
        <Link href="/portal/student" className="text-navy font-semibold">
          Back
        </Link>
      </div>
    );
  }

  function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const match = authenticateStudent(classLevel as ClassLevel, name, password);
    if (!match) {
      setError(
        "Login failed. Check your full name, password, and that you selected the correct class."
      );
      return;
    }
    saveStudentSession({
      studentId: match.id,
      classLevel: match.classLevel,
      name: fullName(match.firstName, match.lastName),
    });
    setStudentId(match.id);
  }

  function logout() {
    clearStudentSession();
    setStudentId(null);
    setPassword("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwdMessage("");
    setPwdError("");
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMessage("");
    setPwdError("");
    if (!student) return;
    if (
      (student.portalPassword ?? "").toUpperCase() !==
      currentPassword.trim().toUpperCase()
    ) {
      setPwdError("Current password is incorrect.");
      return;
    }
    if (newPassword.trim().length < 4) {
      setPwdError("New password must be at least 4 characters.");
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setPwdError("New password and confirmation do not match.");
      return;
    }
    updateStudent(student.id, { portalPassword: newPassword.trim() });
    setPwdMessage("Password updated. Use your new password next time you sign in.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (student) {
    return (
      <div className="min-h-[70vh] bg-mist print:min-h-0 print:bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
                {classLevel} results
              </p>
              <h1 className="font-display mt-1 text-3xl text-ink">
                {fullName(student.firstName, student.lastName)}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {myResults.length > 0 ? (
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => {
                    try {
                      window.print();
                    } catch (err) {
                      console.warn("Print dialog could not be opened.", err);
                    }
                  }}
                >
                  Print results
                </button>
              ) : null}
              <button type="button" className={btnSecondary} onClick={logout}>
                Log out
              </button>
            </div>
          </div>

          {myResults.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[var(--line)] bg-white px-6 py-12 text-center print:hidden">
              <h2 className="font-display text-xl text-ink">No published results yet</h2>
              <p className="mt-2 text-clay">
                Your class teacher has not published ranked results for you yet.
                Please check again later.
              </p>
            </div>
          ) : (
            <div className="print-results-sheet mt-8 print:mt-0">
              <div className="mb-6 hidden border-b border-slate-300 pb-4 print:block">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  {config.name}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {config.location} · {classLevel}
                </p>
                <h1 className="mt-3 font-display text-3xl text-ink">
                  {fullName(student.firstName, student.lastName)}
                </h1>
                <p className="mt-1 text-sm text-slate-600">Pupil results slip</p>
              </div>

              {publishedStandings.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-4">
                  {publishedStandings.map((s) => (
                    <div
                      key={`${s.term}-${s.session}`}
                      className="rounded-2xl border border-[var(--line)] bg-white px-5 py-4 print:rounded-none print:border-slate-300 print:shadow-none"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan print:text-slate-600">
                        {s.term} · {s.session}
                      </p>
                      <p className="mt-2 font-display text-3xl text-navy print:text-ink">
                        Position {s.rank ?? "—"}
                      </p>
                      <p className="mt-1 text-sm text-clay print:text-slate-600">
                        Total {s.total} across {s.subjects}{" "}
                        {s.subjects === 1 ? "subject" : "subjects"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-white print:mt-4 print:overflow-visible print:rounded-none print:border-0">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-navy/5 text-xs uppercase tracking-wider text-clay print:bg-transparent">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Term</th>
                      <th className="px-4 py-3">CA</th>
                      <th className="px-4 py-3">Exam</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myResults.map((r) => (
                      <tr key={r.id} className="border-t border-[var(--line)]">
                        <td className="px-4 py-3 font-medium text-ink">{r.subject}</td>
                        <td className="px-4 py-3">
                          {r.term}
                          <br />
                          <span className="text-clay print:text-slate-600">{r.session}</span>
                        </td>
                        <td className="px-4 py-3">{r.caScore}</td>
                        <td className="px-4 py-3">{r.examScore}</td>
                        <td className="px-4 py-3 font-semibold">{totalScore(r)}</td>
                        <td className="px-4 py-3">
                          <span className="print:hidden">
                            <Badge tone={Number(r.grade) <= 3 ? "ok" : "forest"}>
                              {r.grade} · {r.remark}
                            </Badge>
                          </span>
                          <span className="hidden print:inline">
                            {r.grade} · {r.remark}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-navy print:text-ink">
                          {r.classRank ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-6 hidden text-xs text-slate-500 print:block">
                Printed from {config.name} pupil portal · {config.academicYear}
              </p>
            </div>
          )}

          <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5 print:hidden">
            <h2 className="font-display text-xl text-ink">Change my password</h2>
            <p className="mt-1 text-sm text-clay">
              Only you can change your portal password.
            </p>
            <form onSubmit={changePassword} className="mt-4 max-w-md space-y-3">
              <Field label="Current password">
                <input
                  type="password"
                  className={inputClass}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Field>
              <Field label="New password">
                <input
                  type="password"
                  className={inputClass}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>
              {pwdError ? <p className="text-sm text-danger">{pwdError}</p> : null}
              {pwdMessage ? (
                <p className="mt-1 text-sm text-ok">{pwdMessage}</p>
              ) : null}
              <button type="submit" className={btnPrimary}>
                Update password
              </button>
            </form>
          </section>

          <p className="mt-6 text-sm text-clay print:hidden">
            <Link href={`/portal/student/${section}`} className="font-semibold text-navy">
              ← Other classes
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-mist">
      <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
        <Link
          href={`/portal/student/${section}`}
          className="text-sm font-semibold text-navy hover:underline"
        >
          ← {section === "primary" ? "Primary" : "JHS"} classes
        </Link>
        <h1 className="font-display mt-4 text-3xl text-ink">{classLevel} login</h1>
        <p className="mt-2 text-sm text-clay">
          Enter the full name and password issued by the headmaster.
        </p>

        <form onSubmit={login} className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]">
          <Field label="Full name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button type="submit" className={`${btnPrimary} w-full`}>
            View my results
          </button>
        </form>

        <p className="mt-4 text-xs text-clay">
          Use the full name and password issued by the school. You can change
          your password after signing in.
        </p>
        <button
          type="button"
          className="mt-3 text-xs text-clay underline"
          onClick={() => router.push("/portal")}
        >
          Portal home
        </button>
      </div>
    </div>
  );
}
