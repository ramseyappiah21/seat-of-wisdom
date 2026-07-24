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
import type { ClassLevel, Gender, Student } from "@/lib/types";
import { CLASS_LEVELS } from "@/lib/types";
import { formatDate, fullName, initials } from "@/lib/utils";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const emptyStudent: Omit<Student, "id"> = {
  admissionNo: "",
  firstName: "",
  lastName: "",
  gender: "Female",
  dateOfBirth: "",
  classLevel: "Primary 1",
  guardianName: "",
  guardianPhone: "",
  email: "",
  address: "Afrancho, Kumasi",
  enrollmentDate: new Date().toISOString().slice(0, 10),
  status: "Active",
};

export default function StudentsPage() {
  const { students, ready, addStudent, updateStudent, deleteStudent } = useSchool();
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<ClassLevel | "All">("All");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyStudent);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        fullName(s.firstName, s.lastName).toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q);
      const matchesClass = classFilter === "All" || s.classLevel === classFilter;
      return matchesQuery && matchesClass;
    });
  }, [students, query, classFilter]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyStudent,
      admissionNo: `SOW/${new Date().getFullYear()}/${String(students.length + 1).padStart(3, "0")}`,
    });
    setOpen(true);
  }

  function openEdit(student: Student) {
    const { id: _id, ...rest } = student;
    setEditingId(student.id);
    setForm(rest);
    setOpen(true);
  }

  function save() {
    if (!form.firstName || !form.lastName || !form.admissionNo) return;
    if (editingId) updateStudent(editingId, form);
    else addStudent(form);
    setOpen(false);
  }

  if (!ready) return <p className="text-clay">Loading students…</p>;

  return (
    <div>
      <PageHeader
        title="Pupils"
        description="Maintain enrollment from Nursery through JHS for Seat of Wisdom School, Afrancho, Kumasi."
        action={
          <button type="button" className={btnPrimary} onClick={openCreate}>
            <Plus size={16} /> Add pupil
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-clay" size={16} />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search by name, admission no, or guardian"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No pupils found"
          description="Try another search, or add a new pupil to the register."
        />
      ) : (
        <div className="surface overflow-hidden rounded-2xl animate-rise">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs uppercase tracking-wider text-clay">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pupil</th>
                  <th className="px-4 py-3 font-semibold">Admission</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Guardian</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--line)] hover:bg-white/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage font-semibold text-forest">
                          {initials(s.firstName, s.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{fullName(s.firstName, s.lastName)}</p>
                          <p className="text-clay">{s.gender} · DOB {formatDate(s.dateOfBirth)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink">{s.admissionNo}</td>
                    <td className="px-4 py-3">{s.classLevel}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{s.guardianName}</p>
                      <p className="text-clay">{s.guardianPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={s.status === "Active" ? "ok" : s.status === "Graduated" ? "gold" : "neutral"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" className={btnSecondary} onClick={() => openEdit(s)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className={btnDanger}
                          onClick={() => {
                            if (confirm(`Remove ${fullName(s.firstName, s.lastName)} and related records?`)) {
                              deleteStudent(s.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit pupil" : "Add pupil"}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Admission number">
            <input className={inputClass} value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} />
          </Field>
          <Field label="Class">
            <select className={inputClass} value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value as ClassLevel })}>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>{c}</option>
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
          <Field label="Date of birth">
            <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </Field>
          <Field label="Guardian name">
            <input className={inputClass} value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
          </Field>
          <Field label="Guardian phone">
            <input className={inputClass} value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="Enrollment date">
            <input type="date" className={inputClass} value={form.enrollmentDate} onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })} />
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Student["status"] })}>
              <option>Active</option>
              <option>Inactive</option>
              <option>Graduated</option>
            </select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className={btnPrimary} onClick={save}>Save pupil</button>
        </div>
      </Modal>
    </div>
  );
}
