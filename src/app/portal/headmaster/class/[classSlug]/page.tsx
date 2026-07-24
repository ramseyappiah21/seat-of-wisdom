"use client";

import {
  Field,
  PageHeader,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { EditPupilModal } from "@/components/EditPupilModal";
import { HeadmasterNav } from "@/components/HeadmasterNav";
import {
  clearHeadSession,
  hasHeadSession,
} from "@/lib/portal-auth";
import { useSchool } from "@/lib/store";
import { downloadSpreadsheet, parseImportRows, readSpreadsheetRows } from "@/lib/spreadsheet";
import { SUBJECTS, slugToClass } from "@/lib/types";
import type { Student } from "@/lib/types";
import { fullName } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function HeadmasterClassPupilsPage() {
  const params = useParams<{ classSlug: string }>();
  const router = useRouter();
  const {
    ready,
    students,
    teachers,
    updateTeacher,
    updateStudent,
    deleteStudent,
    issueTeacherPassword,
    importClassNames,
  } = useSchool();

  const classLevel = slugToClass(params.classSlug ?? "");
  const [authed, setAuthed] = useState(false);
  const [query, setQuery] = useState("");
  const [flash, setFlash] = useState("");
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<{
    kind: "reading" | "ok" | "error";
    fileName: string;
    detail: string;
  } | null>(null);
  const [addTeacherId, setAddTeacherId] = useState("");
  const [addSubject, setAddSubject] = useState<string>(SUBJECTS[0]);
  const [editing, setEditing] = useState<Student | null>(null);

  useEffect(() => {
    if (!hasHeadSession()) {
      router.replace("/portal/headmaster");
      return;
    }
    setAuthed(true);
  }, [router]);

  const classTeacher = useMemo(
    () =>
      classLevel
        ? teachers.find((t) => t.homeroomClass === classLevel) ?? null
        : null,
    [teachers, classLevel]
  );

  const subjectTeachers = useMemo(() => {
    if (!classLevel) return [];
    return teachers.filter(
      (t) => t.status === "Active" && t.classes.includes(classLevel)
    );
  }, [teachers, classLevel]);

  const availableToAdd = useMemo(() => {
    if (!classLevel) return [];
    return teachers.filter(
      (t) => t.status === "Active" && !t.classes.includes(classLevel)
    );
  }, [teachers, classLevel]);

  const pupils = useMemo(() => {
    if (!classLevel) return [];
    const q = query.trim().toLowerCase();
    return students
      .filter((s) => s.status === "Active" && s.classLevel === classLevel)
      .filter(
        (s) =>
          !q || fullName(s.firstName, s.lastName).toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          a.lastName.localeCompare(b.lastName) ||
          a.firstName.localeCompare(b.firstName)
      );
  }, [students, classLevel, query]);

  function assignClassTeacher(teacherId: string) {
    if (!classLevel) return;
    teachers.forEach((t) => {
      if (t.homeroomClass === classLevel && t.id !== teacherId) {
        updateTeacher(t.id, { homeroomClass: undefined });
      }
    });
    if (teacherId) {
      const t = teachers.find((x) => x.id === teacherId);
      const classes = t?.classes.includes(classLevel)
        ? t.classes
        : [...(t?.classes ?? []), classLevel];
      updateTeacher(teacherId, { homeroomClass: classLevel, classes });
      setFlash(
        t
          ? `${fullName(t.firstName, t.lastName)} is class teacher of ${classLevel}.`
          : `Assigned class teacher.`
      );
    } else if (classTeacher) {
      updateTeacher(classTeacher.id, { homeroomClass: undefined });
      setFlash(`Removed class teacher for ${classLevel}.`);
    }
  }

  function addSubjectTeacher() {
    if (!classLevel || !addTeacherId) return;
    const t = teachers.find((x) => x.id === addTeacherId);
    if (!t) return;
    const classes = t.classes.includes(classLevel)
      ? t.classes
      : [...t.classes, classLevel];
    updateTeacher(addTeacherId, {
      subject: addSubject,
      classes,
    });
    setFlash(
      `${fullName(t.firstName, t.lastName)} assigned to ${classLevel} as ${addSubject} teacher.`
    );
    setAddTeacherId("");
  }

  function removeSubjectTeacher(teacherId: string) {
    if (!classLevel) return;
    const t = teachers.find((x) => x.id === teacherId);
    if (!t) return;
    updateTeacher(teacherId, {
      classes: t.classes.filter((c) => c !== classLevel),
      ...(t.homeroomClass === classLevel
        ? { homeroomClass: undefined }
        : {}),
    });
    setFlash(
      `${fullName(t.firstName, t.lastName)} removed from ${classLevel}.`
    );
  }

  async function handleExcelImport(file: File | null) {
    if (!file || !classLevel) return;
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
        setFlash(detail);
        return;
      }
      const parsed = parseImportRows(rawRows);
      const list =
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
      if (!list.length) {
        const detail = `No pupil names found in ${file.name}. Need Full Name / Name, or Surname + Other Name (optional Gender / Sex).`;
        setImportStatus({ kind: "error", fileName: file.name, detail });
        setFlash(detail);
        return;
      }
      const created = importClassNames(classLevel, list);
      const skipped = list.length - created;
      const detail =
        created > 0
          ? `Imported ${created} pupil(s) into ${classLevel}${
              skipped ? ` (${skipped} already in class skipped)` : ""
            }.`
          : `No new pupils added — all ${list.length} name(s) are already in ${classLevel}.`;
      setImportStatus({
        kind: created > 0 ? "ok" : "error",
        fileName: file.name,
        detail,
      });
      setFlash(
        created > 0
          ? `${detail} File: ${file.name}`
          : detail
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const detail = `Could not read ${file.name}. ${msg} Try .xlsx or save as CSV.`;
      setImportStatus({ kind: "error", fileName: file.name, detail });
      setFlash(detail);
    }
  }

  function handlePasteImport() {
    if (!classLevel) return;
    const names = importText
      .split(/\r?\n/)
      .map((n) => n.trim())
      .filter(Boolean)
      .map((line) => {
        // "Mensah, Ama" → "Ama Mensah"
        if (line.includes(",")) {
          const [left, ...rest] = line.split(",").map((p) => p.trim());
          const right = rest.join(" ").trim();
          if (left && right) return `${right} ${left}`.replace(/\s+/g, " ");
        }
        // "1. Ama Mensah" / "1 Ama Mensah" / "1\tAma Mensah"
        const stripped = line
          .replace(/^\d+\s*[.)\-:]?\s+/, "")
          .replace(/^\d+\t+/, "")
          .trim();
        return stripped || line;
      })
      .filter(Boolean);
    if (!names.length) {
      setFlash("Paste at least one full name (one name per line).");
      return;
    }
    const created = importClassNames(classLevel, names);
    const skipped = names.length - created;
    setImportText("");
    const detail =
      created > 0
        ? `Imported ${created} new pupil(s) into ${classLevel}${
            skipped ? ` (${skipped} skipped — invalid or already in class)` : ""
          }.`
        : `No new pupils added — those names are invalid or already in ${classLevel}.`;
    setImportStatus({
      kind: created > 0 ? "ok" : "error",
      fileName: "Pasted names",
      detail,
    });
    setFlash(detail);
  }

  if (!ready || !authed) {
    return <p className="p-8 text-clay">Loading…</p>;
  }

  if (!classLevel) {
    return (
      <div className="p-8">
        <p className="text-clay">Class not found.</p>
        <Link
          href="/portal/headmaster"
          className="font-semibold text-navy hover:underline"
        >
          Back to headmaster portal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-mist/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mb-4">
          <Link
            href="/portal/headmaster"
            className="text-sm font-semibold text-navy hover:underline"
          >
            ← All classes
          </Link>
        </p>

        <HeadmasterNav active="classes" />

        <PageHeader
          title={`${classLevel} · Pupils`}
          description="Pupils in this class. Assign class or subject teachers here, or use Assign teachers for the full list."
          action={
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                clearHeadSession();
                router.replace("/portal/headmaster");
              }}
            >
              Log out
            </button>
          }
        />

        {flash ? (
          <p className="mb-4 rounded-xl bg-sky/60 px-4 py-3 text-sm text-navy">
            {flash}
          </p>
        ) : null}

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="font-display text-lg text-ink">Class teacher</h2>
            <p className="mt-1 text-sm text-clay">
              Assign who oversees this class (class password).
            </p>
            <div className="mt-3">
              <select
                className={inputClass}
                value={classTeacher?.id ?? ""}
                onChange={(e) => assignClassTeacher(e.target.value)}
              >
                <option value="">Not assigned</option>
                {teachers
                  .filter((t) => t.status === "Active")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {fullName(t.firstName, t.lastName)} · {t.subject}
                    </option>
                  ))}
              </select>
            </div>
            {classTeacher ? (
              <>
                <p className="mt-3 font-mono text-sm text-navy">
                  Password: {classTeacher.portalPassword ?? "—"}
                </p>
                <button
                  type="button"
                  className={`${btnSecondary} mt-3`}
                  onClick={() => {
                    const p = issueTeacherPassword(classTeacher.id);
                    setFlash(`Class password for ${classLevel}: ${p}`);
                  }}
                >
                  Issue class password
                </button>
              </>
            ) : null}
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="font-display text-lg text-ink">
              Assign subject teacher
            </h2>
            <p className="mt-1 text-sm text-clay">
              Add a teacher to this class for a subject.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Teacher">
                <select
                  className={inputClass}
                  value={addTeacherId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setAddTeacherId(id);
                    const t = teachers.find((x) => x.id === id);
                    if (t) {
                      setAddSubject(
                        SUBJECTS.includes(
                          t.subject as (typeof SUBJECTS)[number]
                        )
                          ? t.subject
                          : t.subject || SUBJECTS[0]
                      );
                    }
                  }}
                >
                  <option value="">Select teacher</option>
                  {availableToAdd.map((t) => (
                    <option key={t.id} value={t.id}>
                      {fullName(t.firstName, t.lastName)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subject">
                <select
                  className={inputClass}
                  value={addSubject}
                  onChange={(e) => setAddSubject(e.target.value)}
                  disabled={!addTeacherId}
                >
                  {!SUBJECTS.includes(
                    addSubject as (typeof SUBJECTS)[number]
                  ) && addSubject ? (
                    <option value={addSubject}>{addSubject}</option>
                  ) : null}
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button
              type="button"
              className={`${btnPrimary} mt-3`}
              disabled={!addTeacherId}
              onClick={addSubjectTeacher}
            >
              Assign to {classLevel}
            </button>
          </section>
        </div>

        <section className="mb-6 rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-lg text-ink">
            Subject teachers & passwords
          </h2>
          {subjectTeachers.length === 0 ? (
            <p className="mt-2 text-sm text-clay">
              No subject teachers for this class yet.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {subjectTeachers.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-2 text-sm last:border-0"
                >
                  <span>
                    <strong className="text-ink">
                      {fullName(t.firstName, t.lastName)}
                    </strong>
                    <span className="text-clay"> · {t.subject}</span>
                    <span className="ml-2 font-mono text-xs text-navy">
                      {t.portalPassword ?? "—"}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => {
                        const p = issueTeacherPassword(t.id);
                        setFlash(
                          `Password for ${fullName(t.firstName, t.lastName)}: ${p}`
                        );
                      }}
                    >
                      Issue
                    </button>
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => removeSubjectTeacher(t.id)}
                    >
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-xl text-ink">
            Import pupils into {classLevel}
          </h2>
          <p className="mt-1 text-sm text-clay">
            Upload Excel (.xlsx / .xls) or CSV for this class only. Use a{" "}
            <strong>Name</strong> / <strong>Full Name</strong> column, or{" "}
            <strong>Surname</strong> + <strong>Other Name</strong>, and optional{" "}
            <strong>Gender</strong> / <strong>Sex</strong>. A plain list of names
            (one per row) also works — serial numbers in the first column are
            fine. ALL-CAPS names are accepted.
          </p>

          <div className="mt-4">
            <p className="mb-1.5 text-sm font-medium text-forest">
              Excel / CSV file
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="block w-full text-sm text-clay file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper"
              onChange={(e) => {
                void handleExcelImport(e.target.files?.[0] ?? null);
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
                Choose a file to import — you’ll see the filename and result here.
              </p>
            )}
          </div>

          <p className="mt-4 text-sm font-medium text-navy">
            Or paste names (one per line)
          </p>
          <textarea
            className={`${inputClass} mt-2 min-h-[100px] font-mono text-sm`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={"Ama Mensah\nKofi Asante\nAkua Frimpong"}
          />
          <button
            type="button"
            className={`${btnPrimary} mt-3`}
            onClick={handlePasteImport}
          >
            Add names to {classLevel}
          </button>
        </section>

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">
                Pupils in {classLevel}
              </h2>
              <p className="mt-1 text-sm text-clay">
                {pupils.length} pupil{pupils.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={`${inputClass} sm:w-56`}
                placeholder="Search pupil name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                className={btnSecondary}
                disabled={pupils.length === 0}
                onClick={() => {
                  void (async () => {
                    if (!classLevel || pupils.length === 0) return;
                    const rows: Array<Array<string | number>> = [
                      ["Pupil"],
                      ...pupils.map((s) => [
                        fullName(s.firstName, s.lastName),
                      ]),
                    ];
                    await downloadSpreadsheet(
                      `${classLevel.replace(/\s+/g, "-")}-pupils`,
                      rows,
                      "Pupils"
                    );
                    setFlash(
                      `Exported ${pupils.length} pupil name(s) for ${classLevel}.`
                    );
                  })();
                }}
              >
                Export pupils
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-clay">
            Passwords are random codes (not names). Pupils can change their
            password after signing in.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy/5 text-xs uppercase tracking-wider text-clay">
                <tr>
                  <th className="px-4 py-3">Pupil</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pupils.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-clay"
                    >
                      No pupils in this class yet. Import a class list from the
                      headmaster portal.
                    </td>
                  </tr>
                ) : (
                  pupils.map((s) => {
                    return (
                      <tr key={s.id} className="border-t border-[var(--line)]">
                        <td className="px-4 py-3 font-medium text-ink">
                          {fullName(s.firstName, s.lastName)}
                        </td>
                        <td className="px-4 py-3 text-clay">{s.gender}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {s.portalPassword ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className={btnSecondary}
                            onClick={() => setEditing(s)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <EditPupilModal
          pupil={editing}
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          onSave={(id, data) => {
            updateStudent(id, {
              firstName: data.firstName,
              lastName: data.lastName,
              classLevel: data.classLevel,
              gender: data.gender,
              status: data.status,
            });
            setFlash(
              `Updated pupil: ${fullName(data.firstName, data.lastName)}.`
            );
          }}
          onDelete={(id) => {
            const s = students.find((x) => x.id === id);
            deleteStudent(id);
            setFlash(
              s
                ? `Removed ${fullName(s.firstName, s.lastName)}.`
                : "Pupil removed."
            );
          }}
        />
      </div>
    </div>
  );
}
