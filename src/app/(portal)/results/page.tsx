"use client";

import { Modal } from "@/components/Modal";
import {
  Badge,
  EmptyState,
  Field,
  PageHeader,
  StatCard,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { useSchool } from "@/lib/store";
import type { ClassLevel, ResultRecord, Term } from "@/lib/types";
import { CLASS_LEVELS, SUBJECTS, TERMS } from "@/lib/types";
import { fullName, totalScore } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type ResultForm = Omit<ResultRecord, "id" | "grade" | "remark">;

const emptyResult: ResultForm = {
  studentId: "",
  subject: SUBJECTS[0],
  term: "First Term",
  session: "2025/2026",
  classLevel: "Primary 1",
  caScore: 0,
  examScore: 0,
  submitted: true,
  published: true,
};

export default function ResultsPage() {
  const { students, results, ready, addResult, updateResult, deleteResult } =
    useSchool();
  const [classFilter, setClassFilter] = useState<ClassLevel | "All">("All");
  const [termFilter, setTermFilter] = useState<Term | "All">("All");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResultForm>(emptyResult);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const classOk = classFilter === "All" || r.classLevel === classFilter;
      const termOk = termFilter === "All" || r.term === termFilter;
      return classOk && termOk;
    });
  }, [results, classFilter, termFilter]);

  const avg =
    filtered.length === 0
      ? 0
      : Math.round(
          filtered.reduce((sum, r) => sum + totalScore(r), 0) / filtered.length
        );

  const distinctions = filtered.filter((r) => Number(r.grade) <= 3).length;

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyResult,
      studentId: students[0]?.id ?? "",
      classLevel: students[0]?.classLevel ?? "Primary 1",
    });
    setOpen(true);
  }

  function openEdit(result: ResultRecord) {
    setEditingId(result.id);
    setForm({
      studentId: result.studentId,
      subject: result.subject,
      term: result.term,
      session: result.session,
      classLevel: result.classLevel,
      caScore: result.caScore,
      examScore: result.examScore,
      submitted: result.submitted ?? result.published ?? true,
      published: result.published ?? true,
      classRank: result.classRank,
    });
    setOpen(true);
  }

  function save() {
    if (!form.studentId) return;
    if (editingId) updateResult(editingId, form);
    else addResult(form);
    setOpen(false);
  }

  if (!ready) return <p className="text-clay">Loading results…</p>;

  return (
    <div>
      <PageHeader
        title="Results"
        description="Record class exercises and exam scores. Grades follow the Ghana stanine scale (1 highest – 9 lowest)."
        action={
          <button type="button" className={btnPrimary} onClick={openCreate}>
            <Plus size={16} /> Enter result
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Records" value={filtered.length} />
        <StatCard label="Average score" value={filtered.length ? avg : "—"} tone="gold" />
        <StatCard label="Grades 1–3" value={distinctions} tone="ok" />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <select
          className={`${inputClass} sm:w-44`}
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value as ClassLevel | "All")}
        >
          <option value="All">All classes</option>
          {CLASS_LEVELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={`${inputClass} sm:w-44`}
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value as Term | "All")}
        >
          <option value="All">All terms</option>
          {TERMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Enter CA and exam scores to build the term report sheet."
        />
      ) : (
        <div className="surface overflow-hidden rounded-2xl animate-rise">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs uppercase tracking-wider text-clay">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pupil</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Term</th>
                  <th className="px-4 py-3 font-semibold">CA</th>
                  <th className="px-4 py-3 font-semibold">Exam</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Grade</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const student = students.find((s) => s.id === r.studentId);
                  return (
                    <tr key={r.id} className="border-t border-[var(--line)] hover:bg-white/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {student
                            ? fullName(student.firstName, student.lastName)
                            : "Unknown"}
                        </p>
                        <p className="text-clay">{r.classLevel}</p>
                      </td>
                      <td className="px-4 py-3">{r.subject}</td>
                      <td className="px-4 py-3">
                        {r.term}
                        <br />
                        <span className="text-clay">{r.session}</span>
                      </td>
                      <td className="px-4 py-3">{r.caScore}</td>
                      <td className="px-4 py-3">{r.examScore}</td>
                      <td className="px-4 py-3 font-semibold">{totalScore(r)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            Number(r.grade) <= 3
                              ? "ok"
                              : Number(r.grade) >= 7
                                ? "danger"
                                : "forest"
                          }
                        >
                          Grade {r.grade} · {r.remark}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button type="button" className={btnSecondary} onClick={() => openEdit(r)}>
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className={btnDanger}
                            onClick={() => {
                              if (confirm("Delete this result?")) deleteResult(r.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit result" : "Enter result"}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pupil" className="sm:col-span-2">
            <select
              className={inputClass}
              value={form.studentId}
              onChange={(e) => {
                const student = students.find((s) => s.id === e.target.value);
                setForm({
                  ...form,
                  studentId: e.target.value,
                  classLevel: student?.classLevel ?? form.classLevel,
                });
              }}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {fullName(s.firstName, s.lastName)} · {s.classLevel}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subject">
            <select
              className={inputClass}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Class">
            <select
              className={inputClass}
              value={form.classLevel}
              onChange={(e) =>
                setForm({ ...form, classLevel: e.target.value as ClassLevel })
              }
            >
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Term">
            <select
              className={inputClass}
              value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value as Term })}
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
              value={form.session}
              onChange={(e) => setForm({ ...form, session: e.target.value })}
            />
          </Field>
          <Field label="Class exercises / CA (max 40)">
            <input
              type="number"
              min={0}
              max={40}
              className={inputClass}
              value={form.caScore}
              onChange={(e) =>
                setForm({ ...form, caScore: Number(e.target.value) })
              }
            />
          </Field>
          <Field label="End-of-term exam (max 60)">
            <input
              type="number"
              min={0}
              max={60}
              className={inputClass}
              value={form.examScore}
              onChange={(e) =>
                setForm({ ...form, examScore: Number(e.target.value) })
              }
            />
          </Field>
        </div>
        <p className="mt-4 text-sm text-clay">
          Total: {form.caScore + form.examScore} / 100 — grade is assigned on save.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={save}>
            Save result
          </button>
        </div>
      </Modal>
    </div>
  );
}
