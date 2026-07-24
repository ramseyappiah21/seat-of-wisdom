"use client";

import { Badge, Field, btnPrimary, btnSecondary, inputClass } from "@/components/ui";
import {
  clearTeacherSession,
  getTeacherSession,
  saveTeacherSession,
} from "@/lib/portal-auth";
import { useSchool } from "@/lib/store";
import { downloadSpreadsheet, parseImportRows, readSpreadsheetRows } from "@/lib/spreadsheet";
import {
  TERMS,
  type ClassLevel,
  type Student,
  type Term,
} from "@/lib/types";
import { cn, computeClassRanks, fullName, rankByTotal, totalScore } from "@/lib/utils";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";

const NO_CLASSES: ClassLevel[] = [];
const NO_PUPILS: Student[] = [];

type TeacherTab = "subject" | "class";

export default function TeacherPortalPage() {
  const {
    ready,
    students,
    results,
    teachers,
    authenticateTeacher,
    importClassNames,
    importClassResults,
    saveTeacherResults,
    rankClassResults,
    publishClassResults,
  } = useSchool();

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<TeacherTab>("subject");

  const [classLevel, setClassLevel] = useState<ClassLevel | "">("");
  const [term, setTerm] = useState<Term>("First Term");
  const [session, setSession] = useState("2025/2026");
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<{
    kind: "reading" | "ok" | "error";
    fileName: string;
    detail: string;
  } | null>(null);
  const [scores, setScores] = useState<Record<string, { ca: string; exam: string }>>({});
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const sessionData = getTeacherSession();
    if (sessionData) setTeacherId(sessionData.teacherId);
    setSessionReady(true);
  }, []);

  const teacher = useMemo(
    () => teachers.find((t) => t.id === teacherId) ?? null,
    [teachers, teacherId]
  );

  const teachingClasses = teacher?.classes?.length
    ? teacher.classes
    : NO_CLASSES;

  const subject = teacher?.subject ?? "";

  const classPupils = useMemo(() => {
    if (!teacher || !classLevel || !teachingClasses.includes(classLevel)) {
      return NO_PUPILS;
    }
    return students.filter(
      (s) => s.classLevel === classLevel && s.status === "Active"
    );
  }, [teacher, students, classLevel, teachingClasses]);

  const homeroomClass = teacher?.homeroomClass;
  const homeroomPupils = useMemo(() => {
    if (!homeroomClass) return NO_PUPILS;
    return students.filter(
      (s) => s.classLevel === homeroomClass && s.status === "Active"
    );
  }, [students, homeroomClass]);

  const homeroomResults = useMemo(() => {
    if (!homeroomClass) return [];
    return results.filter(
      (r) =>
        r.classLevel === homeroomClass &&
        r.term === term &&
        r.session === session &&
        (r.submitted || r.published)
    );
  }, [results, homeroomClass, term, session]);

  const classStanding = useMemo(() => {
    if (!homeroomClass) return [];
    const ranks = computeClassRanks(homeroomResults);
    const totals = new Map<string, number>();
    const subjectCounts = new Map<string, number>();
    for (const r of homeroomResults) {
      totals.set(r.studentId, (totals.get(r.studentId) ?? 0) + totalScore(r));
      subjectCounts.set(
        r.studentId,
        (subjectCounts.get(r.studentId) ?? 0) + 1
      );
    }
    return [...homeroomPupils]
      .map((p) => ({
        pupil: p,
        total: totals.get(p.id) ?? 0,
        subjects: subjectCounts.get(p.id) ?? 0,
        rank: ranks.get(p.id),
        published: homeroomResults.some(
          (r) => r.studentId === p.id && r.published
        ),
        ranked: homeroomResults.some(
          (r) => r.studentId === p.id && r.classRank != null
        ),
      }))
      .filter((row) => row.subjects > 0)
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
  }, [homeroomClass, homeroomPupils, homeroomResults]);

  const subjectsReceived = useMemo(() => {
    const set = new Set(homeroomResults.map((r) => r.subject));
    return [...set].sort();
  }, [homeroomResults]);

  const marksByPupilSubject = useMemo(() => {
    const map = new Map<string, (typeof homeroomResults)[number]>();
    for (const r of homeroomResults) {
      map.set(`${r.studentId}::${r.subject}`, r);
    }
    return map;
  }, [homeroomResults]);

  /** Position within each subject (1 = highest total for that subject). */
  const subjectRanks = useMemo(() => {
    const bySubject = new Map<string, Map<string, number>>();
    for (const subjectName of subjectsReceived) {
      const entries = homeroomResults
        .filter((r) => r.subject === subjectName)
        .map((r) => ({ id: r.studentId, total: totalScore(r) }));
      bySubject.set(subjectName, rankByTotal(entries));
    }
    return bySubject;
  }, [subjectsReceived, homeroomResults]);

  const allPublished =
    homeroomResults.length > 0 &&
    homeroomResults.every((r) => r.published);

  const allRanked =
    homeroomResults.length > 0 &&
    homeroomResults.every((r) => r.classRank != null);

  useEffect(() => {
    if (!teacher) return;
    if (!teachingClasses.length) {
      setClassLevel((prev) => (prev === "" ? prev : ""));
      return;
    }
    setClassLevel((prev) =>
      prev && teachingClasses.includes(prev) ? prev : teachingClasses[0]
    );
  }, [teacher, teachingClasses]);

  const pupilIdsKey = classPupils.map((p) => p.id).join(",");

  // Load saved marks when class / subject / term changes (do not depend on
  // `results`, or typing can be wiped if that array reference changes).
  useEffect(() => {
    if (!teacher || !classLevel || !subject) return;
    const next: Record<string, { ca: string; exam: string }> = {};
    for (const pupil of classPupils) {
      const existing = results.find(
        (r) =>
          r.studentId === pupil.id &&
          r.subject === subject &&
          r.term === term &&
          r.session === session
      );
      next[pupil.id] = {
        ca: existing ? String(existing.caScore) : "",
        exam: existing ? String(existing.examScore) : "",
      };
    }
    setScores(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, classLevel, subject, term, session, pupilIdsKey]);

  if (!ready || !sessionReady) return <p className="p-8 text-clay">Loading…</p>;

  function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const match = authenticateTeacher(name, password);
    if (!match) {
      setError(
        "Login failed. Ask the headmaster for your password and class assignment."
      );
      return;
    }
    saveTeacherSession({
      teacherId: match.id,
      name: fullName(match.firstName, match.lastName),
    });
    setTeacherId(match.id);
    setClassLevel(match.classes[0] ?? "");
    setTab("subject");
  }

  function logout() {
    clearTeacherSession();
    setTeacherId(null);
    setPassword("");
  }

  function handleImportNames() {
    if (!classLevel) return;
    const names = importText
      .split(/\r?\n/)
      .map((n) => n.trim())
      .filter(Boolean)
      .map((line) => {
        if (line.includes(",")) {
          const [left, ...rest] = line.split(",").map((p) => p.trim());
          const right = rest.join(" ").trim();
          if (left && right) return `${right} ${left}`.replace(/\s+/g, " ");
        }
        return line;
      })
      .filter(Boolean);
    const created = importClassNames(classLevel, names);
    setMessage(
      created > 0
        ? `Imported ${created} new pupil name(s) into ${classLevel}.`
        : `No new pupils added — those names are already in ${classLevel}.`
    );
    setImportText("");
  }

  function handleImportResultsFromText() {
    if (!classLevel || !subject) return;
    const rows = importText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          fullName: parts[0],
          subject,
          caScore: Number(parts.length >= 4 ? parts[2] : parts[1]) || 0,
          examScore: Number(parts.length >= 4 ? parts[3] : parts[2]) || 0,
          term,
          session,
        };
      })
      .filter((r) => r.fullName);
    const { studentsCreated, resultsSaved } = importClassResults(
      classLevel,
      rows,
      teacher?.id,
      false
    );
    setMessage(
      `Saved ${resultsSaved} ${subject} score(s) into ${classLevel}. Created ${studentsCreated} pupil(s). Publish to send to that class.`
    );
    setImportText("");
  }

  async function handleFile(file: File | null) {
    if (!file || !classLevel || !subject) return;
    setImportStatus({
      kind: "reading",
      fileName: file.name,
      detail: "Reading file…",
    });
    try {
      const rawRows = await readSpreadsheetRows(file);
      if (!rawRows.length) {
        const detail = `No rows found in ${file.name}.`;
        setImportStatus({ kind: "error", fileName: file.name, detail });
        setMessage(detail);
        return;
      }
      const parsed = parseImportRows(rawRows);

      if (parsed.mode === "names") {
        const pupils =
          parsed.pupils.length > 0
            ? parsed.pupils
            : parsed.names.map((n) => {
                const parts = n.trim().split(/\s+/);
                return {
                  fullName: n,
                  firstName: parts[0] || n,
                  lastName: parts.slice(1).join(" "),
                };
              });
        if (!pupils.length) {
          const detail = `No pupil names found in ${file.name}.`;
          setImportStatus({ kind: "error", fileName: file.name, detail });
          setMessage(detail);
          return;
        }
        const created = importClassNames(classLevel, pupils);
        const detail = `Imported ${created} pupil(s) into ${classLevel} (${pupils.length} found under Pupil).`;
        setImportStatus({
          kind: created > 0 ? "ok" : "error",
          fileName: file.name,
          detail,
        });
        setMessage(`From ${file.name}: ${detail}`);
        return;
      }

      if (!parsed.results.length) {
        const detail = `No score rows found in ${file.name}.`;
        setImportStatus({ kind: "error", fileName: file.name, detail });
        setMessage(detail);
        return;
      }

      const rows = parsed.results.map((r) => ({
        fullName: r.fullName,
        subject: subject,
        caScore: r.caScore,
        examScore: r.examScore,
        term,
        session,
      }));
      const { studentsCreated, resultsSaved } = importClassResults(
        classLevel,
        rows,
        teacher?.id,
        false
      );
      const detail = `Saved ${resultsSaved} ${subject} result(s) into ${classLevel}. Created ${studentsCreated} pupil(s).`;
      setImportStatus({ kind: "ok", fileName: file.name, detail });
      setMessage(`From ${file.name}: ${detail}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const detail = `Could not read ${file.name}. ${msg} Try .xlsx or save as CSV.`;
      setImportStatus({ kind: "error", fileName: file.name, detail });
      setMessage(detail);
    }
  }

  function saveDraft() {
    if (!teacher || !classLevel || !subject) return;
    const payload = classPupils
      .map((pupil) => {
        if (scores[pupil.id]?.ca === "" && scores[pupil.id]?.exam === "") {
          return null;
        }
        const ca = Number(scores[pupil.id]?.ca);
        const exam = Number(scores[pupil.id]?.exam);
        return {
          studentId: pupil.id,
          subject,
          term,
          session,
          classLevel,
          caScore: Number.isNaN(ca) ? 0 : ca,
          examScore: Number.isNaN(exam) ? 0 : exam,
          submitted: false,
          published: false,
          teacherId: teacher.id,
        };
      })
      .filter(Boolean);
    saveTeacherResults(payload as Parameters<typeof saveTeacherResults>[0]);
    setMessage(
      `Draft saved: ${subject} for ${classLevel} (${payload.length} pupils). Not sent to the class teacher yet.`
    );
  }

  function sendToClassTeacher() {
    if (!teacher || !classLevel || !subject) return;
    const payload = classPupils
      .map((pupil) => {
        if (scores[pupil.id]?.ca === "" && scores[pupil.id]?.exam === "") {
          return null;
        }
        const ca = Number(scores[pupil.id]?.ca);
        const exam = Number(scores[pupil.id]?.exam);
        return {
          studentId: pupil.id,
          subject,
          term,
          session,
          classLevel,
          caScore: Number.isNaN(ca) ? 0 : ca,
          examScore: Number.isNaN(exam) ? 0 : exam,
          submitted: true,
          published: false,
          teacherId: teacher.id,
        };
      })
      .filter(Boolean);
    saveTeacherResults(payload as Parameters<typeof saveTeacherResults>[0]);
    setMessage(
      `Sent ${subject} to the ${classLevel} class teacher (${payload.length} pupil(s)). Pupils will see results after the class teacher ranks and sends them.`
    );
  }

  function rankClass() {
    if (!homeroomClass) return;
    const count = rankClassResults(homeroomClass, term, session);
    if (count === 0) {
      setMessage(
        `No subject results have been sent to ${homeroomClass} for ${term} yet.`
      );
      return;
    }
    setMessage(
      `Ranked ${homeroomClass} (${count} subject record(s)). Results are not visible to pupils until you send them.`
    );
  }

  function sendToPupils() {
    if (!homeroomClass) return;
    if (!allRanked) {
      setMessage("Rank the class first, then send results to pupils.");
      return;
    }
    const count = publishClassResults(homeroomClass, term, session);
    if (count === 0) {
      setMessage(
        `No subject results have been sent to ${homeroomClass} for ${term} yet.`
      );
      return;
    }
    setMessage(
      `Sent results to ${homeroomClass} pupils (${count} subject record(s) published).`
    );
  }

  async function exportClassRanking() {
    if (!homeroomClass || classStanding.length === 0) {
      setMessage("Nothing to export yet.");
      return;
    }

    try {
      const header1: Array<string | number> = ["Pupil"];
      const header2: Array<string | number> = [""];
      for (const subjectName of subjectsReceived) {
        header1.push(subjectName, "", "", "");
        header2.push("CA", "Exam", "Tot", "Pos");
      }
      header1.push("Overall", "");
      header2.push("Tot", "Pos");

      const body = classStanding.map((row) => {
        const line: Array<string | number> = [
          fullName(row.pupil.firstName, row.pupil.lastName),
        ];
        for (const subjectName of subjectsReceived) {
          const mark = marksByPupilSubject.get(`${row.pupil.id}::${subjectName}`);
          const subjectPos = subjectRanks.get(subjectName)?.get(row.pupil.id);
          line.push(
            mark ? mark.caScore : "",
            mark ? mark.examScore : "",
            mark ? totalScore(mark) : "",
            subjectPos ?? ""
          );
        }
        line.push(row.total, row.rank ?? "");
        return line;
      });

      const fileBase = `${homeroomClass.replace(/\s+/g, "-")}-${term.replace(/\s+/g, "-")}-${session.replace(/\//g, "-")}-ranking`;
      await downloadSpreadsheet(
        fileBase,
        [
          [`${homeroomClass} · ${term} · ${session}`],
          [],
          header1,
          header2,
          ...body,
        ],
        "Class ranking"
      );
      setMessage(`Exported class ranking for ${homeroomClass}.`);
    } catch (err) {
      console.warn(err);
      setMessage("Export failed. Please try again.");
    }
  }

  async function exportPupilList() {
    if (!homeroomClass || homeroomPupils.length === 0) {
      setMessage("No pupils to export.");
      return;
    }
    try {
      const rows: Array<Array<string | number>> = [
        ["Pupil"],
        ...[...homeroomPupils]
          .sort(
            (a, b) =>
              a.lastName.localeCompare(b.lastName) ||
              a.firstName.localeCompare(b.firstName)
          )
          .map((p) => [fullName(p.firstName, p.lastName)]),
      ];
      const fileBase = `${homeroomClass.replace(/\s+/g, "-")}-pupils`;
      await downloadSpreadsheet(fileBase, rows, "Pupils");
      setMessage(`Exported ${homeroomPupils.length} pupil name(s) for ${homeroomClass}.`);
    } catch (err) {
      console.warn(err);
      setMessage("Export failed. Please try again.");
    }
  }

  if (!teacher) {
    return (
      <div className="min-h-[70vh] bg-mist">
        <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
          <Link href="/portal" className="text-sm font-semibold text-navy hover:underline">
            ← All portals
          </Link>
          <h1 className="font-display mt-4 text-3xl text-ink">Teacher portal</h1>
          <p className="mt-2 text-sm text-clay">
            Enter subject results for the classes you teach, and view your class
            portal if you are a class teacher.
          </p>
          <form
            onSubmit={login}
            className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
          >
            <Field label="Full name">
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mary Addo"
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
              Enter teacher portal
            </button>
          </form>
          <p className="mt-4 text-xs text-clay">
            Demo: <strong>Mary Addo</strong> / <strong>K7M2XP</strong>
          </p>
        </div>
      </div>
    );
  }

  if (!teachingClasses.length && !homeroomClass) {
    return (
      <div className="min-h-[70vh] bg-mist">
        <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
          <h1 className="font-display text-3xl text-ink">
            {fullName(teacher.firstName, teacher.lastName)}
          </h1>
          <p className="mt-4 rounded-xl border border-[var(--line)] bg-white px-5 py-6 text-clay">
            The headmaster has not assigned you any teaching class or class-teacher
            role yet.
          </p>
          <button type="button" className={`${btnSecondary} mt-4`} onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-mist">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
              Teacher portal
            </p>
            <h1 className="font-display mt-1 text-3xl text-ink">
              {fullName(teacher.firstName, teacher.lastName)}
            </h1>
            <p className="text-sm text-clay">
              Subject: <strong className="text-navy">{subject}</strong>
              {homeroomClass ? (
                <>
                  {" "}
                  · Class teacher of{" "}
                  <strong className="text-navy">{homeroomClass}</strong>
                </>
              ) : null}
            </p>
            <p className="mt-1 text-sm text-clay">
              Teaches: {teachingClasses.join(", ") || "—"}
            </p>
          </div>
          <button type="button" className={btnSecondary} onClick={logout}>
            Log out
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("subject")}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              tab === "subject"
                ? "bg-navy text-paper"
                : "border border-[var(--line)] bg-white text-navy"
            )}
          >
            Subject results
          </button>
          <button
            type="button"
            onClick={() => setTab("class")}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              tab === "class"
                ? "bg-navy text-paper"
                : "border border-[var(--line)] bg-white text-navy"
            )}
          >
            My class portal
          </button>
        </div>

        {message ? (
          <p className="mt-4 rounded-xl bg-sky/60 px-4 py-3 text-sm text-navy">{message}</p>
        ) : null}

        {tab === "subject" ? (
          <>
            <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-sm text-clay">
                Enter or import <strong>{subject}</strong> scores for one of your
                teaching classes. When you send results, they are stored under that
                specific class for pupils to view.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field label="Send results to class">
                  <select
                    className={inputClass}
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                  >
                    {teachingClasses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Term">
                  <select
                    className={inputClass}
                    value={term}
                    onChange={(e) => setTerm(e.target.value as Term)}
                  >
                    {TERMS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Session">
                  <input
                    className={inputClass}
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {!teachingClasses.length ? (
              <p className="mt-6 rounded-xl border border-[var(--line)] bg-white px-5 py-6 text-clay">
                No teaching classes assigned. Ask the headmaster to assign classes
                for your subject.
              </p>
            ) : (
              <>
                <section className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4 sm:px-6">
                    <h2 className="font-display text-xl text-ink sm:text-2xl">
                      {subject} · {classLevel} ({classPupils.length} pupils)
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={btnSecondary} onClick={saveDraft}>
                        Save draft
                      </button>
                      <button
                        type="button"
                        className={btnPrimary}
                        onClick={sendToClassTeacher}
                      >
                        Send to class teacher
                      </button>
                    </div>
                  </div>

                  {classPupils.length === 0 ? (
                    <p className="px-5 py-12 text-center text-clay sm:px-6">
                      No pupils in {classLevel} yet. Import names first (or ask the
                      headmaster to import the class list).
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-base">
                        <thead className="bg-navy/5 text-xs uppercase tracking-wider text-clay sm:text-sm">
                          <tr>
                            <th className="px-5 py-4 sm:px-6">Pupil</th>
                            <th className="px-5 py-4 sm:px-6">CA (40)</th>
                            <th className="px-5 py-4 sm:px-6">Exam (60)</th>
                            <th className="px-5 py-4 sm:px-6">Total</th>
                            <th className="px-5 py-4 sm:px-6">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classPupils.map((pupil) => {
                            const ca = Number(scores[pupil.id]?.ca) || 0;
                            const exam = Number(scores[pupil.id]?.exam) || 0;
                            const existing = results.find(
                              (r) =>
                                r.studentId === pupil.id &&
                                r.subject === subject &&
                                r.term === term &&
                                r.session === session
                            );
                            return (
                              <tr
                                key={pupil.id}
                                className="border-t border-[var(--line)]"
                              >
                                <td className="px-5 py-4 font-medium text-ink sm:px-6 sm:py-5">
                                  {fullName(pupil.firstName, pupil.lastName)}
                                </td>
                                <td className="px-5 py-4 sm:px-6 sm:py-5">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    className="w-24 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-left text-base font-semibold text-[var(--ink)] outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
                                    value={scores[pupil.id]?.ca ?? ""}
                                    onChange={(e) => {
                                      const ca = e.target.value.replace(/[^\d.]/g, "");
                                      setScores((prev) => ({
                                        ...prev,
                                        [pupil.id]: {
                                          ca,
                                          exam: prev[pupil.id]?.exam ?? "",
                                        },
                                      }));
                                    }}
                                  />
                                </td>
                                <td className="px-5 py-4 sm:px-6 sm:py-5">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    className="w-24 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-left text-base font-semibold text-[var(--ink)] outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
                                    value={scores[pupil.id]?.exam ?? ""}
                                    onChange={(e) => {
                                      const exam = e.target.value.replace(/[^\d.]/g, "");
                                      setScores((prev) => ({
                                        ...prev,
                                        [pupil.id]: {
                                          ca: prev[pupil.id]?.ca ?? "",
                                          exam,
                                        },
                                      }));
                                    }}
                                  />
                                </td>
                                <td className="px-5 py-4 text-lg font-semibold sm:px-6 sm:py-5">
                                  {scores[pupil.id]?.ca || scores[pupil.id]?.exam
                                    ? ca + exam
                                    : existing
                                      ? totalScore(existing)
                                      : "—"}
                                </td>
                                <td className="px-5 py-4 text-clay sm:px-6 sm:py-5">
                                  {existing
                                    ? existing.published
                                      ? "With pupils"
                                      : existing.submitted
                                        ? "With class teacher"
                                        : "Draft"
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5">
                  <h2 className="font-display text-xl text-ink">
                    Import Excel / CSV → {subject} → {classLevel}
                  </h2>
                  <p className="mt-1 text-sm text-clay">
                    Names only, or names with CA and Exam. Scores are saved into{" "}
                    <strong>{classLevel}</strong> for <strong>{subject}</strong>.
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="mt-4 block w-full text-sm text-clay file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper"
                    onChange={(e) => {
                      void handleFile(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                  />
                  {importStatus ? (
                    <div
                      role="status"
                      className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
                        importStatus.kind === "ok"
                          ? "border-cyan/40 bg-sky/50 text-navy"
                          : importStatus.kind === "reading"
                            ? "border-[var(--line)] bg-mist/60 text-clay"
                            : "border-red-200 bg-red-50 text-red-900"
                      }`}
                    >
                      <p className="font-semibold">
                        {importStatus.kind === "reading"
                          ? "Importing…"
                          : importStatus.kind === "ok"
                            ? "File imported"
                            : "Import issue"}
                      </p>
                      <p className="mt-0.5 font-mono text-xs break-all">
                        {importStatus.fileName}
                      </p>
                      <p className="mt-1.5">{importStatus.detail}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-clay">
                      Choose a file to import — you’ll see the filename and result
                      here.
                    </p>
                  )}
                  <textarea
                    className={`${inputClass} mt-4 min-h-[100px] font-mono text-sm`}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={"Ama Mensah\n\nor\nAma Mensah, 28, 52"}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={handleImportNames}
                    >
                      Import names only
                    </button>
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={handleImportResultsFromText}
                    >
                      Import into {classLevel}
                    </button>
                  </div>
                </section>
              </>
            )}
          </>
        ) : (
          <section className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="font-display text-xl text-ink">My class portal</h2>
            {!homeroomClass ? (
              <p className="mt-3 text-clay">
                You are not assigned as a class teacher yet. Ask the headmaster to
                set your class.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-clay">
                  Receive subject results for <strong>{homeroomClass}</strong>, rank
                  the class, then send each pupil their results with their position.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:max-w-md">
                  <Field label="Term">
                    <select
                      className={inputClass}
                      value={term}
                      onChange={(e) => setTerm(e.target.value as Term)}
                    >
                      {TERMS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Session">
                    <input
                      className={inputClass}
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={rankClass}
                    disabled={homeroomResults.length === 0}
                  >
                    {allRanked ? "Re-rank class" : "Rank class"}
                  </button>
                  <button
                    type="button"
                    className={btnPrimary}
                    onClick={sendToPupils}
                    disabled={homeroomResults.length === 0 || !allRanked}
                  >
                    {allPublished ? "Send to pupils again" : "Send to pupils"}
                  </button>
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => void exportClassRanking()}
                    disabled={classStanding.length === 0}
                  >
                    Export ranking
                  </button>
                  <p className="text-sm text-clay">
                    Subjects received:{" "}
                    {subjectsReceived.length
                      ? subjectsReceived.join(", ")
                      : "none yet"}
                  </p>
                </div>

                <h3 className="mt-8 font-display text-lg text-ink">
                  Class ranking
                </h3>
                <p className="mt-1 text-sm text-clay">
                  Each subject shows CA, Exam, total, and position, plus overall
                  total and position. Pupils only see results after you send them.
                </p>
                {classStanding.length === 0 ? (
                  <p className="mt-2 text-clay">
                    Waiting for subject teachers to send marks for {term}.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-navy/5 text-xs uppercase tracking-wider text-clay">
                        <tr>
                          <th
                            rowSpan={2}
                            className="sticky left-0 z-10 bg-navy/5 px-4 py-3 align-bottom"
                          >
                            Pupil
                          </th>
                          {subjectsReceived.map((subjectName) => (
                            <th
                              key={subjectName}
                              className="px-3 py-3 text-center"
                              colSpan={4}
                            >
                              {subjectName}
                            </th>
                          ))}
                          <th className="px-3 py-3 text-center" colSpan={2}>
                            Overall
                          </th>
                          <th
                            rowSpan={2}
                            className="px-4 py-3 text-center align-bottom"
                          >
                            Status
                          </th>
                        </tr>
                        <tr>
                          {subjectsReceived.map((subjectName) => (
                            <Fragment key={`${subjectName}-sub`}>
                              <th className="px-2 py-2 text-center font-normal">
                                CA
                              </th>
                              <th className="px-2 py-2 text-center font-normal">
                                Exam
                              </th>
                              <th className="px-2 py-2 text-center font-normal">
                                Tot
                              </th>
                              <th className="px-2 py-2 text-center font-normal">
                                Pos
                              </th>
                            </Fragment>
                          ))}
                          <th className="px-2 py-2 text-center font-normal">
                            Tot
                          </th>
                          <th className="px-2 py-2 text-center font-normal">
                            Pos
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStanding.map((row) => (
                          <tr
                            key={row.pupil.id}
                            className="border-t border-[var(--line)]"
                          >
                            <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-ink">
                              {fullName(row.pupil.firstName, row.pupil.lastName)}
                            </td>
                            {subjectsReceived.map((subjectName) => {
                              const mark = marksByPupilSubject.get(
                                `${row.pupil.id}::${subjectName}`
                              );
                              const subjectPos = subjectRanks
                                .get(subjectName)
                                ?.get(row.pupil.id);
                              return (
                                <Fragment key={`${row.pupil.id}-${subjectName}`}>
                                  <td className="px-2 py-3 text-center text-clay">
                                    {mark ? mark.caScore : "—"}
                                  </td>
                                  <td className="px-2 py-3 text-center text-clay">
                                    {mark ? mark.examScore : "—"}
                                  </td>
                                  <td className="px-2 py-3 text-center font-semibold">
                                    {mark ? totalScore(mark) : "—"}
                                  </td>
                                  <td className="px-2 py-3 text-center font-semibold text-navy">
                                    {subjectPos ?? "—"}
                                  </td>
                                </Fragment>
                              );
                            })}
                            <td className="px-2 py-3 text-center font-semibold">
                              {row.total}
                            </td>
                            <td className="px-2 py-3 text-center font-semibold text-navy">
                              {row.rank ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge
                                tone={
                                  row.published
                                    ? "ok"
                                    : row.ranked
                                      ? "forest"
                                      : "warn"
                                }
                              >
                                {row.published
                                  ? "Sent to pupils"
                                  : row.ranked
                                    ? "Ranked"
                                    : "Not ranked"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-lg text-ink">
                    Pupils ({homeroomPupils.length})
                  </h3>
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={() => void exportPupilList()}
                    disabled={homeroomPupils.length === 0}
                  >
                    Export pupils
                  </button>
                </div>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {homeroomPupils.map((p) => (
                    <li
                      key={p.id}
                      className="rounded-lg border border-[var(--line)] bg-mist/50 px-3 py-2 text-sm"
                    >
                      {fullName(p.firstName, p.lastName)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
