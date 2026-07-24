"use client";

import {
  Badge,
  Field,
  PageHeader,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { HeadmasterNav } from "@/components/HeadmasterNav";
import {
  clearHeadSession,
  hasHeadSession,
} from "@/lib/portal-auth";
import { useSchool } from "@/lib/store";
import {
  CLASS_LEVELS,
  SUBJECTS,
  classToSlug,
  type ClassLevel,
  type Gender,
} from "@/lib/types";
import { fullName } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HeadmasterAssignTeachersPage() {
  const router = useRouter();
  const { ready, teachers, addTeacher, updateTeacher, issueTeacherPassword } =
    useSchool();

  const [authed, setAuthed] = useState(false);
  const [flash, setFlash] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignSubject, setAssignSubject] = useState<string>(SUBJECTS[0]);
  const [assignClasses, setAssignClasses] = useState<ClassLevel[]>([]);
  const [assignHomeroom, setAssignHomeroom] = useState<ClassLevel | "">("");

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newGender, setNewGender] = useState<Gender>("Female");
  const [newSubject, setNewSubject] = useState<string>(SUBJECTS[0]);
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    if (!hasHeadSession()) {
      router.replace("/portal/headmaster");
      return;
    }
    setAuthed(true);
  }, [router]);

  function loadTeacherIntoAssignForm(teacherId: string) {
    setAssignTeacherId(teacherId);
    const t = teachers.find((x) => x.id === teacherId);
    if (!t) {
      setAssignSubject(SUBJECTS[0]);
      setAssignClasses([]);
      setAssignHomeroom("");
      return;
    }
    setAssignSubject(t.subject || SUBJECTS[0]);
    setAssignClasses([...t.classes]);
    setAssignHomeroom(t.homeroomClass ?? "");
  }

  function toggleAssignClass(level: ClassLevel) {
    setAssignClasses((prev) =>
      prev.includes(level) ? prev.filter((c) => c !== level) : [...prev, level]
    );
  }

  function toggleTeacherClass(
    teacherId: string,
    level: ClassLevel,
    current: ClassLevel[]
  ) {
    const next = current.includes(level)
      ? current.filter((c) => c !== level)
      : [...current, level];
    updateTeacher(teacherId, { classes: next });
    setFlash(
      `Updated teaching classes: ${next.length ? next.join(", ") : "none yet"}.`
    );
    if (assignTeacherId === teacherId) setAssignClasses(next);
  }

  function saveTeacherAssignment() {
    if (!assignTeacherId) {
      setFlash("Select a teacher first.");
      return;
    }
    const t = teachers.find((x) => x.id === assignTeacherId);
    if (!t) return;

    if (assignHomeroom) {
      teachers.forEach((other) => {
        if (
          other.id !== assignTeacherId &&
          other.homeroomClass === assignHomeroom
        ) {
          updateTeacher(other.id, { homeroomClass: undefined });
        }
      });
    }

    updateTeacher(assignTeacherId, {
      subject: assignSubject.trim() || t.subject,
      classes: assignClasses,
      homeroomClass: assignHomeroom || undefined,
    });

    setFlash(
      `Saved: ${fullName(t.firstName, t.lastName)} → ${assignSubject}` +
        (assignClasses.length
          ? `, teaches ${assignClasses.join(", ")}`
          : ", no teaching classes yet") +
        (assignHomeroom ? `, class teacher of ${assignHomeroom}` : "") +
        "."
    );
  }

  function addNewTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim()) {
      setFlash("Enter the teacher’s first name and surname.");
      return;
    }
    const staffId = `SOW-T-${100 + teachers.length + 1}`;
    addTeacher({
      staffId,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      gender: newGender,
      email:
        newEmail.trim() ||
        `${newFirstName.trim().toLowerCase()}.${newLastName.trim().toLowerCase()}@seatofwisdom.edu.gh`,
      phone: newPhone.trim(),
      subject: newSubject,
      classes: [],
      hireDate: new Date().toISOString().slice(0, 10),
      status: "Active",
    });
    setFlash(
      `Added ${fullName(newFirstName.trim(), newLastName.trim())} (${newSubject}). Assign their classes below.`
    );
    setNewFirstName("");
    setNewLastName("");
    setNewPhone("");
    setNewEmail("");
    setNewGender("Female");
    setNewSubject(SUBJECTS[0]);
  }

  if (!ready || !authed) {
    return <p className="p-8 text-clay">Loading…</p>;
  }

  return (
    <div className="min-h-[70vh] bg-mist/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <HeadmasterNav active="assign" />

        <PageHeader
          title="Assign teachers"
          description="Assign each teacher to a subject and to the class(es) they teach. You can also set the class teacher for a class."
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
          <h2 className="font-display text-xl text-ink">Add teacher</h2>
          <p className="mt-1 text-sm text-clay">
            Add a new teacher to the list, then assign their subject and classes
            below.
          </p>
          <form
            onSubmit={addNewTeacher}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <Field label="Other name / first name">
              <input
                className={inputClass}
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                required
              />
            </Field>
            <Field label="Surname">
              <input
                className={inputClass}
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                required
              />
            </Field>
            <Field label="Gender">
              <select
                className={inputClass}
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as Gender)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </Field>
            <Field label="Subject">
              <select
                className={inputClass}
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Phone (optional)">
              <input
                className={inputClass}
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </Field>
            <Field label="Email (optional)">
              <input
                type="email"
                className={inputClass}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className={btnPrimary}>
                Add to teachers list
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-xl text-ink">
            Assign to subject & class
          </h2>
          <p className="mt-1 text-sm text-clay">
            Pick a teacher, choose their subject, tap the classes they teach,
            then save.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Teacher">
              <select
                className={inputClass}
                value={assignTeacherId}
                onChange={(e) => loadTeacherIntoAssignForm(e.target.value)}
              >
                <option value="">Select teacher</option>
                {teachers
                  .filter((t) => t.status === "Active")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {fullName(t.firstName, t.lastName)}
                      {t.subject ? ` · ${t.subject}` : ""}
                    </option>
                  ))}
              </select>
            </Field>

            <Field label="Subject">
              <select
                className={inputClass}
                value={assignSubject}
                onChange={(e) => setAssignSubject(e.target.value)}
                disabled={!assignTeacherId}
              >
                {!SUBJECTS.includes(assignSubject) && assignSubject ? (
                  <option value={assignSubject}>{assignSubject}</option>
                ) : null}
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-forest">
              Teaching classes
            </p>
            <div className="flex flex-wrap gap-2">
              {CLASS_LEVELS.map((level) => {
                const active = assignClasses.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    disabled={!assignTeacherId}
                    onClick={() => toggleAssignClass(level)}
                    className={
                      active
                        ? "rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-50"
                        : "rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs text-clay disabled:opacity-50"
                    }
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 max-w-sm">
            <Field label="Also class teacher of (optional)">
              <select
                className={inputClass}
                value={assignHomeroom}
                onChange={(e) =>
                  setAssignHomeroom(e.target.value as ClassLevel | "")
                }
                disabled={!assignTeacherId}
              >
                <option value="">Not a class teacher</option>
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button
            type="button"
            className={`${btnPrimary} mt-5`}
            disabled={!assignTeacherId}
            onClick={saveTeacherAssignment}
          >
            Save assignment
          </button>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-xl text-ink">
            Class teacher for each class
          </h2>
          <p className="mt-1 text-sm text-clay">
            Quick assign: who is the class teacher of each class.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy/5 text-xs uppercase tracking-wider text-clay">
                <tr>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Class teacher</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Assign</th>
                </tr>
              </thead>
              <tbody>
                {CLASS_LEVELS.map((level) => {
                  const classTeacher = teachers.find(
                    (t) => t.homeroomClass === level
                  );
                  return (
                    <tr key={level} className="border-t border-[var(--line)]">
                      <td className="px-4 py-3">
                        <Link
                          href={`/portal/headmaster/class/${classToSlug(level)}`}
                          className="font-medium text-navy hover:underline"
                        >
                          {level}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {classTeacher
                          ? fullName(
                              classTeacher.firstName,
                              classTeacher.lastName
                            )
                          : (
                            <span className="text-clay">Not assigned</span>
                          )}
                      </td>
                      <td className="px-4 py-3 text-clay">
                        {classTeacher?.subject ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {classTeacher?.portalPassword ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            className={`${inputClass} min-w-[160px]`}
                            value={classTeacher?.id ?? ""}
                            onChange={(e) => {
                              const nextId = e.target.value;
                              teachers.forEach((t) => {
                                if (
                                  t.homeroomClass === level &&
                                  t.id !== nextId
                                ) {
                                  updateTeacher(t.id, {
                                    homeroomClass: undefined,
                                  });
                                }
                              });
                              if (nextId) {
                                const t = teachers.find((x) => x.id === nextId);
                                const classes =
                                  t && !t.classes.includes(level)
                                    ? [...t.classes, level]
                                    : t?.classes;
                                updateTeacher(nextId, {
                                  homeroomClass: level,
                                  ...(classes ? { classes } : {}),
                                });
                                setFlash(
                                  t
                                    ? `${fullName(t.firstName, t.lastName)} is class teacher of ${level}.`
                                    : `Assigned class teacher for ${level}.`
                                );
                              } else if (classTeacher) {
                                updateTeacher(classTeacher.id, {
                                  homeroomClass: undefined,
                                });
                                setFlash(
                                  `Removed class teacher for ${level}.`
                                );
                              }
                            }}
                          >
                            <option value="">Select teacher</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {fullName(t.firstName, t.lastName)}
                              </option>
                            ))}
                          </select>
                          {classTeacher ? (
                            <button
                              type="button"
                              className={btnSecondary}
                              onClick={() => {
                                const p = issueTeacherPassword(classTeacher.id);
                                setFlash(
                                  `Password for ${fullName(classTeacher.firstName, classTeacher.lastName)}: ${p}`
                                );
                              }}
                            >
                              Issue password
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-xl text-ink">All teachers</h2>
          <p className="mt-1 text-sm text-clay">
            Change subject, teaching classes, or class-teacher role for any
            teacher.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy/5 text-xs uppercase tracking-wider text-clay">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Teaches in</th>
                  <th className="px-4 py-3">Class teacher of</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">
                        {fullName(t.firstName, t.lastName)}
                      </p>
                      <p className="text-xs text-clay">{t.staffId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`${inputClass} min-w-[160px]`}
                        value={t.subject}
                        onChange={(e) => {
                          updateTeacher(t.id, { subject: e.target.value });
                          setFlash(
                            `${fullName(t.firstName, t.lastName)} subject set to ${e.target.value}.`
                          );
                          if (assignTeacherId === t.id) {
                            setAssignSubject(e.target.value);
                          }
                        }}
                      >
                        {!SUBJECTS.includes(t.subject) ? (
                          <option value={t.subject}>{t.subject}</option>
                        ) : null}
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {CLASS_LEVELS.map((level) => {
                          const active = t.classes.includes(level);
                          return (
                            <button
                              key={level}
                              type="button"
                              title="Toggle teaching class"
                              onClick={() =>
                                toggleTeacherClass(t.id, level, t.classes)
                              }
                              className={
                                active
                                  ? "rounded bg-navy px-1.5 py-0.5 text-[10px] font-semibold text-paper"
                                  : "rounded border border-[var(--line)] bg-white px-1.5 py-0.5 text-[10px] text-clay"
                              }
                            >
                              {level
                                .replace("Primary ", "P")
                                .replace("JHS ", "J")}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`${inputClass} min-w-[140px]`}
                        value={t.homeroomClass ?? ""}
                        onChange={(e) => {
                          const next = e.target.value as ClassLevel | "";
                          if (next) {
                            teachers.forEach((other) => {
                              if (
                                other.id !== t.id &&
                                other.homeroomClass === next
                              ) {
                                updateTeacher(other.id, {
                                  homeroomClass: undefined,
                                });
                              }
                            });
                          }
                          updateTeacher(t.id, {
                            homeroomClass: next || undefined,
                          });
                          setFlash(
                            next
                              ? `${fullName(t.firstName, t.lastName)} is class teacher of ${next}.`
                              : `${fullName(t.firstName, t.lastName)} is no longer a class teacher.`
                          );
                          if (assignTeacherId === t.id) {
                            setAssignHomeroom(next);
                          }
                        }}
                      >
                        <option value="">—</option>
                        {CLASS_LEVELS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.portalPassword ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={t.status === "Active" ? "ok" : "neutral"}>
                          {t.status}
                        </Badge>
                        <button
                          type="button"
                          className={btnSecondary}
                          onClick={() => loadTeacherIntoAssignForm(t.id)}
                        >
                          Edit above
                        </button>
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
                          Issue password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
