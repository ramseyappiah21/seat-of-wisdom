"use client";

import { EditPupilModal } from "@/components/EditPupilModal";
import { HeadmasterNav } from "@/components/HeadmasterNav";
import {
  PageHeader,
  btnDanger,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import {
  clearHeadSession,
  hasHeadSession,
} from "@/lib/portal-auth";
import { useSchool } from "@/lib/store";
import { downloadSpreadsheet } from "@/lib/spreadsheet";
import {
  CLASS_LEVELS,
  classToSlug,
  type ClassLevel,
  type Student,
} from "@/lib/types";
import { fullName } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function HeadmasterAllPupilsPage() {
  const router = useRouter();
  const {
    ready,
    students,
    updateStudent,
    deleteStudent,
    clearAllPupils,
    clearClassPupils,
  } = useSchool();

  const [authed, setAuthed] = useState(false);
  const [pupilFilter, setPupilFilter] = useState<ClassLevel | "All">("All");
  const [pupilQuery, setPupilQuery] = useState("");
  const [flash, setFlash] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);

  useEffect(() => {
    if (!hasHeadSession()) {
      router.replace("/portal/headmaster");
      return;
    }
    setAuthed(true);
  }, [router]);

  const allPupils = useMemo(() => {
    const q = pupilQuery.trim().toLowerCase();
    return students
      .filter((s) => s.status === "Active")
      .filter((s) => pupilFilter === "All" || s.classLevel === pupilFilter)
      .filter(
        (s) =>
          !q || fullName(s.firstName, s.lastName).toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          a.classLevel.localeCompare(b.classLevel) ||
          a.lastName.localeCompare(b.lastName) ||
          a.firstName.localeCompare(b.firstName)
      );
  }, [students, pupilFilter, pupilQuery]);

  if (!ready || !authed) {
    return <p className="p-8 text-clay">Loading…</p>;
  }

  return (
    <div className="min-h-[70vh] bg-mist">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <HeadmasterNav active="pupils" />

        <PageHeader
          title="All pupils"
          description="Every pupil across all classes. Sample Primary 5 names (Ama Mensah, Kofi Asante, and others) appear here and under Classes → Primary 5."
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

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Pupil list</h2>
              <p className="mt-1 text-sm text-clay">
                {allPupils.length} shown
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <input
                className={`${inputClass} sm:w-56`}
                placeholder="Search pupil name"
                value={pupilQuery}
                onChange={(e) => setPupilQuery(e.target.value)}
              />
              <select
                className={`${inputClass} sm:w-44`}
                value={pupilFilter}
                onChange={(e) =>
                  setPupilFilter(e.target.value as ClassLevel | "All")
                }
              >
                <option value="All">All classes</option>
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={btnSecondary}
                disabled={allPupils.length === 0}
                onClick={() => {
                  void (async () => {
                    if (allPupils.length === 0) return;
                    const rows: Array<Array<string | number>> = [
                      ["Pupil"],
                      ...allPupils.map((s) => [
                        fullName(s.firstName, s.lastName),
                      ]),
                    ];
                    const label =
                      pupilFilter === "All"
                        ? "all-pupils"
                        : `${pupilFilter.replace(/\s+/g, "-")}-pupils`;
                    await downloadSpreadsheet(label, rows, "Pupils");
                    setFlash(`Exported ${allPupils.length} pupil name(s).`);
                  })();
                }}
              >
                Export pupils
              </button>
              {pupilFilter !== "All" ? (
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Remove all pupils in ${pupilFilter}? Their results and fees for this class will also be cleared.`
                      )
                    ) {
                      return;
                    }
                    const n = clearClassPupils(pupilFilter);
                    setFlash(`Cleared ${n} pupil(s) from ${pupilFilter}.`);
                  }}
                >
                  Clear this class
                </button>
              ) : (
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => {
                    if (
                      !window.confirm(
                        "Remove ALL pupils from the school list? This also clears pupil results, attendance, and fees. Teachers are kept."
                      )
                    ) {
                      return;
                    }
                    const n = clearAllPupils();
                    setFlash(`Cleared all pupils (${n} removed).`);
                  }}
                >
                  Clear all pupils
                </button>
              )}
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
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {allPupils.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-clay"
                    >
                      No pupils yet. Open a class and import a class list.
                    </td>
                  </tr>
                ) : (
                  allPupils.map((s) => (
                    <tr key={s.id} className="border-t border-[var(--line)]">
                      <td className="px-4 py-3 font-medium text-ink">
                        {fullName(s.firstName, s.lastName)}
                      </td>
                      <td className="px-4 py-3 text-clay">{s.gender}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/portal/headmaster/class/${classToSlug(s.classLevel)}`}
                          className="text-navy hover:underline"
                        >
                          {s.classLevel}
                        </Link>
                      </td>
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
                  ))
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
