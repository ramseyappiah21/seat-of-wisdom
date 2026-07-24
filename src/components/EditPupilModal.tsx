"use client";

import { Modal } from "@/components/Modal";
import { Field, btnPrimary, btnSecondary, inputClass } from "@/components/ui";
import type { ClassLevel, Gender, Student } from "@/lib/types";
import { CLASS_LEVELS } from "@/lib/types";
import { useEffect, useState } from "react";

export type PupilEditForm = {
  firstName: string;
  lastName: string;
  classLevel: ClassLevel;
  gender: Gender;
  status: Student["status"];
};

export function EditPupilModal({
  pupil,
  open,
  onClose,
  onSave,
  onDelete,
}: {
  pupil: Student | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: PupilEditForm) => void;
  onDelete?: (id: string) => void;
}) {
  const [form, setForm] = useState<PupilEditForm>({
    firstName: "",
    lastName: "",
    classLevel: "Primary 1",
    gender: "Female",
    status: "Active",
  });

  useEffect(() => {
    if (!pupil) return;
    setForm({
      firstName: pupil.firstName,
      lastName: pupil.lastName,
      classLevel: pupil.classLevel,
      gender: pupil.gender,
      status: pupil.status,
    });
  }, [pupil]);

  if (!pupil) return null;

  return (
    <Modal open={open} title="Edit pupil" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.firstName.trim()) return;
          onSave(pupil.id, {
            ...form,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim() || form.firstName.trim(),
          });
          onClose();
        }}
      >
        <p className="rounded-xl bg-mist/60 px-3 py-2 text-xs text-clay">
          Portal password cannot be changed here. Only the pupil can change their
          own password after signing in.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Other name / first name">
            <input
              className={inputClass}
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              required
            />
          </Field>
          <Field label="Surname">
            <input
              className={inputClass}
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Class">
            <select
              className={inputClass}
              value={form.classLevel}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  classLevel: e.target.value as ClassLevel,
                }))
              }
            >
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select
              className={inputClass}
              value={form.gender}
              onChange={(e) =>
                setForm((f) => ({ ...f, gender: e.target.value as Gender }))
              }
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </Field>
        </div>

        <Field label="Status">
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as Student["status"],
              }))
            }
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
          </select>
        </Field>

        <div className="flex flex-wrap justify-between gap-2 pt-2">
          {onDelete ? (
            <button
              type="button"
              className="rounded-xl border border-danger/30 bg-white px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/5"
              onClick={() => {
                if (
                  window.confirm(
                    `Remove ${form.firstName} ${form.lastName} from the pupil list?`
                  )
                ) {
                  onDelete(pupil.id);
                  onClose();
                }
              }}
            >
              Delete pupil
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className={btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              Save changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
