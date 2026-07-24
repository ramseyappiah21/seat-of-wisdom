"use client";

import { Modal } from "@/components/Modal";
import {
  Badge,
  EmptyState,
  Field,
  PageHeader,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { useSchool } from "@/lib/store";
import type { ClassLevel, Gender, Teacher } from "@/lib/types";
import { CLASS_LEVELS, SUBJECTS } from "@/lib/types";
import { formatDate, fullName, initials } from "@/lib/utils";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const emptyTeacher: Omit<Teacher, "id"> = {
  staffId: "",
  firstName: "",
  lastName: "",
  gender: "Female",
  email: "",
  phone: "",
  subject: SUBJECTS[0],
  classes: ["Primary 1"],
  hireDate: new Date().toISOString().slice(0, 10),
  status: "Active",
};

export default function TeachersPage() {
  const { teachers, ready, addTeacher, updateTeacher, deleteTeacher } = useSchool();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyTeacher);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return teachers.filter(
      (t) =>
        !q ||
        fullName(t.firstName, t.lastName).toLowerCase().includes(q) ||
        t.staffId.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
    );
  }, [teachers, query]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyTeacher,
      staffId: `SOW-T-${100 + teachers.length + 1}`,
    });
    setOpen(true);
  }

  function openEdit(teacher: Teacher) {
    const { id: _id, ...rest } = teacher;
    setEditingId(teacher.id);
    setForm(rest);
    setOpen(true);
  }

  function toggleClass(level: ClassLevel) {
    setForm((prev) => ({
      ...prev,
      classes: prev.classes.includes(level)
        ? prev.classes.filter((c) => c !== level)
        : [...prev.classes, level],
    }));
  }

  function save() {
    if (!form.firstName || !form.lastName || !form.staffId) return;
    if (editingId) updateTeacher(editingId, form);
    else addTeacher(form);
    setOpen(false);
  }

  if (!ready) return <p className="text-clay">Loading teachers…</p>;

  return (
    <div>
      <PageHeader
        title="Teachers"
        description="Staff directory for subject teachers across Nursery, KG, Primary, and JHS at Afrancho, Kumasi."
        action={
          <button type="button" className={btnPrimary} onClick={openCreate}>
            <Plus size={16} /> Add teacher
          </button>
        }
      />

      <div className="mb-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-clay" size={16} />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search by name, staff ID, or subject"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No teachers found" description="Add teaching staff to begin assigning classes and subjects." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t, i) => (
            <article
              key={t.id}
              className="surface rounded-2xl p-5 animate-rise"
              style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-paper font-semibold">
                    {initials(t.firstName, t.lastName)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-ink">
                      {fullName(t.firstName, t.lastName)}
                    </h3>
                    <p className="text-sm text-clay">{t.staffId}</p>
                  </div>
                </div>
                <Badge
                  tone={
                    t.status === "Active" ? "ok" : t.status === "On Leave" ? "warn" : "neutral"
                  }
                >
                  {t.status}
                </Badge>
              </div>
              <p className="mt-4 text-sm font-semibold text-forest">{t.subject}</p>
              <p className="mt-1 text-sm text-clay">{t.classes.join(" · ")}</p>
              <p className="mt-3 text-sm text-clay">{t.email}</p>
              <p className="text-sm text-clay">{t.phone}</p>
              <p className="mt-2 text-xs uppercase tracking-wider text-clay">
                Hired {formatDate(t.hireDate)}
              </p>
              <div className="mt-4 flex gap-2">
                <button type="button" className={btnSecondary} onClick={() => openEdit(t)}>
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => {
                    if (confirm(`Remove ${fullName(t.firstName, t.lastName)}?`)) {
                      deleteTeacher(t.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit teacher" : "Add teacher"} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Staff ID">
            <input className={inputClass} value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} />
          </Field>
          <Field label="Subject">
            <select className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="First name">
            <input className={inputClass} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Field>
          <Field label="Last name">
            <input className={inputClass} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Field>
          <Field label="Gender">
            <select className={inputClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
              <option>Female</option>
              <option>Male</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Teacher["status"] })}>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Hire date" className="sm:col-span-2">
            <input type="date" className={inputClass} value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium text-forest">Assigned classes</p>
            <div className="flex flex-wrap gap-2">
              {CLASS_LEVELS.map((level) => {
                const active = form.classes.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => toggleClass(level)}
                    className={
                      active
                        ? "rounded-lg bg-forest px-3 py-1.5 text-sm font-semibold text-paper"
                        : "rounded-lg border border-[var(--line)] bg-white/70 px-3 py-1.5 text-sm font-medium text-forest"
                    }
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={save}>Save teacher</button>
        </div>
      </Modal>
    </div>
  );
}
