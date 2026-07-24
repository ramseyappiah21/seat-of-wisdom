"use client";

import {
  Badge,
  EmptyState,
  Field,
  PageHeader,
  StatCard,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { useSchool } from "@/lib/store";
import type { AttendanceStatus, ClassLevel } from "@/lib/types";
import { CLASS_LEVELS } from "@/lib/types";
import { formatDate, fullName } from "@/lib/utils";
import { Save } from "lucide-react";
import { useMemo, useState } from "react";

const statuses: AttendanceStatus[] = ["Present", "Absent", "Late", "Excused"];

export default function AttendancePage() {
  const { students, attendance, ready, upsertAttendance } = useSchool();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [classLevel, setClassLevel] = useState<ClassLevel>("Primary 5");
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savedMsg, setSavedMsg] = useState("");

  const classStudents = useMemo(
    () =>
      students.filter(
        (s) => s.classLevel === classLevel && s.status === "Active"
      ),
    [students, classLevel]
  );

  const existingForDay = useMemo(
    () =>
      attendance.filter((a) => a.date === date && a.classLevel === classLevel),
    [attendance, date, classLevel]
  );

  const marks = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    for (const s of classStudents) {
      map[s.id] =
        draft[s.id] ??
        existingForDay.find((a) => a.studentId === s.id)?.status ??
        "Present";
    }
    return map;
  }, [classStudents, draft, existingForDay]);

  const noteMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of classStudents) {
      map[s.id] =
        notes[s.id] ??
        existingForDay.find((a) => a.studentId === s.id)?.note ??
        "";
    }
    return map;
  }, [classStudents, notes, existingForDay]);

  const presentCount = Object.values(marks).filter(
    (s) => s === "Present" || s === "Late"
  ).length;

  function save() {
    upsertAttendance(
      classStudents.map((s) => ({
        studentId: s.id,
        date,
        classLevel,
        status: marks[s.id],
        note: noteMap[s.id] || undefined,
      }))
    );
    setSavedMsg(`Attendance saved for ${classLevel} on ${formatDate(date)}.`);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  function markAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of classStudents) next[s.id] = status;
    setDraft(next);
  }

  if (!ready) return <p className="text-clay">Loading attendance…</p>;

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Mark daily presence by class for pupils from Nursery through JHS."
        action={
          <button type="button" className={btnPrimary} onClick={save} disabled={classStudents.length === 0}>
            <Save size={16} /> Save attendance
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Class size" value={classStudents.length} />
        <StatCard label="Present / late" value={presentCount} tone="ok" />
        <StatCard
          label="Rate"
          value={
            classStudents.length
              ? `${Math.round((presentCount / classStudents.length) * 100)}%`
              : "—"
          }
          tone="gold"
        />
      </div>

      <div className="surface mb-5 grid gap-4 rounded-2xl p-4 sm:grid-cols-3">
        <Field label="Date">
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setDraft({});
              setNotes({});
            }}
          />
        </Field>
        <Field label="Class">
          <select
            className={inputClass}
            value={classLevel}
            onChange={(e) => {
              setClassLevel(e.target.value as ClassLevel);
              setDraft({});
              setNotes({});
            }}
          >
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => markAll("Present")}>
            Mark all present
          </button>
        </div>
      </div>

      {savedMsg ? (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-ok animate-fade">
          {savedMsg}
        </p>
      ) : null}

      {classStudents.length === 0 ? (
        <EmptyState
          title="No active pupils in this class"
          description="Choose another class or enroll pupils first."
        />
      ) : (
        <div className="surface overflow-hidden rounded-2xl animate-rise">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs uppercase tracking-wider text-clay">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pupil</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {fullName(s.firstName, s.lastName)}
                      </p>
                      <p className="text-clay">{s.admissionNo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {statuses.map((status) => {
                          const active = marks[s.id] === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() =>
                                setDraft((prev) => ({ ...prev, [s.id]: status }))
                              }
                              className={
                                active
                                  ? "rounded-lg bg-forest px-2.5 py-1 text-xs font-semibold text-paper"
                                  : "rounded-lg border border-[var(--line)] px-2.5 py-1 text-xs font-medium text-forest"
                              }
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[200px]">
                      <input
                        className={inputClass}
                        placeholder="Optional note"
                        value={noteMap[s.id]}
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [s.id]: e.target.value }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Recent attendance log</h2>
        <div className="mt-4 space-y-2">
          {attendance.slice(0, 8).map((a) => {
            const student = students.find((s) => s.id === a.studentId);
            return (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-white/50 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-ink">
                    {student
                      ? fullName(student.firstName, student.lastName)
                      : "Unknown"}
                  </span>
                  <span className="text-clay">
                    {" "}
                    · {a.classLevel} · {formatDate(a.date)}
                  </span>
                </div>
                <Badge
                  tone={
                    a.status === "Present"
                      ? "ok"
                      : a.status === "Absent"
                        ? "danger"
                        : a.status === "Late"
                          ? "warn"
                          : "gold"
                  }
                >
                  {a.status}
                </Badge>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
