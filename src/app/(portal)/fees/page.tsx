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
import type { FeeRecord, Term } from "@/lib/types";
import { TERMS } from "@/lib/types";
import { formatCurrency, formatDate, fullName } from "@/lib/utils";
import { Banknote, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type FeeForm = Omit<FeeRecord, "id" | "status">;

const emptyFee: FeeForm = {
  studentId: "",
  description: "Tuition Fee",
  term: "First Term",
  session: "2025/2026",
  amount: 0,
  amountPaid: 0,
  dueDate: new Date().toISOString().slice(0, 10),
  lastPaymentDate: undefined,
};

export default function FeesPage() {
  const {
    students,
    fees,
    ready,
    addFee,
    updateFee,
    recordPayment,
    deleteFee,
  } = useSchool();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [form, setForm] = useState<FeeForm>(emptyFee);

  const filtered = useMemo(() => {
    return fees.filter(
      (f) => statusFilter === "All" || f.status === statusFilter
    );
  }, [fees, statusFilter]);

  const collected = fees.reduce((sum, f) => sum + f.amountPaid, 0);
  const billed = fees.reduce((sum, f) => sum + f.amount, 0);
  const outstanding = billed - collected;
  const overdue = fees.filter((f) => f.status === "Overdue").length;

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyFee,
      studentId: students[0]?.id ?? "",
      amount: 1200,
    });
    setOpen(true);
  }

  function openEdit(fee: FeeRecord) {
    setEditingId(fee.id);
    setForm({
      studentId: fee.studentId,
      description: fee.description,
      term: fee.term,
      session: fee.session,
      amount: fee.amount,
      amountPaid: fee.amountPaid,
      dueDate: fee.dueDate,
      lastPaymentDate: fee.lastPaymentDate,
    });
    setOpen(true);
  }

  function openPay(fee: FeeRecord) {
    setPayingId(fee.id);
    setPayAmount(Math.max(0, fee.amount - fee.amountPaid));
    setPayOpen(true);
  }

  function save() {
    if (!form.studentId || form.amount <= 0) return;
    if (editingId) updateFee(editingId, form);
    else addFee(form);
    setOpen(false);
  }

  function savePayment() {
    if (!payingId || payAmount <= 0) return;
    recordPayment(payingId, payAmount);
    setPayOpen(false);
  }

  if (!ready) return <p className="text-clay">Loading fees…</p>;

  return (
    <div>
      <PageHeader
        title="Fees"
        description="Track tuition, feeding, PTA and exam levies in Ghana cedis (GHS) for Afrancho families."
        action={
          <button type="button" className={btnPrimary} onClick={openCreate}>
            <Plus size={16} /> Add fee invoice
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total billed" value={formatCurrency(billed)} />
        <StatCard label="Collected" value={formatCurrency(collected)} tone="ok" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} tone="warn" />
        <StatCard label="Overdue invoices" value={overdue} tone="gold" />
      </div>

      <div className="mb-5">
        <select
          className={`${inputClass} sm:w-48`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          <option>Paid</option>
          <option>Partial</option>
          <option>Unpaid</option>
          <option>Overdue</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No fee records"
          description="Create invoices for tuition, boarding, and other levies."
        />
      ) : (
        <div className="surface overflow-hidden rounded-2xl animate-rise">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-forest/5 text-xs uppercase tracking-wider text-clay">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pupil</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Paid</th>
                  <th className="px-4 py-3 font-semibold">Due</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const student = students.find((s) => s.id === f.studentId);
                  const balance = f.amount - f.amountPaid;
                  return (
                    <tr key={f.id} className="border-t border-[var(--line)] hover:bg-white/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">
                          {student
                            ? fullName(student.firstName, student.lastName)
                            : "Unknown"}
                        </p>
                        <p className="text-clay">
                          {f.term} · {f.session}
                        </p>
                      </td>
                      <td className="px-4 py-3">{f.description}</td>
                      <td className="px-4 py-3">{formatCurrency(f.amount)}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(f.amountPaid)}
                        {balance > 0 ? (
                          <p className="text-xs text-warn">
                            Bal {formatCurrency(balance)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{formatDate(f.dueDate)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            f.status === "Paid"
                              ? "ok"
                              : f.status === "Overdue"
                                ? "danger"
                                : f.status === "Partial"
                                  ? "warn"
                                  : "neutral"
                          }
                        >
                          {f.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {balance > 0 ? (
                            <button
                              type="button"
                              className={btnPrimary}
                              onClick={() => openPay(f)}
                            >
                              <Banknote size={14} /> Pay
                            </button>
                          ) : null}
                          <button type="button" className={btnSecondary} onClick={() => openEdit(f)}>
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className={btnDanger}
                            onClick={() => {
                              if (confirm("Delete this fee record?")) deleteFee(f.id);
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
        title={editingId ? "Edit fee invoice" : "Add fee invoice"}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pupil" className="sm:col-span-2">
            <select
              className={inputClass}
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {fullName(s.firstName, s.lastName)} · {s.classLevel}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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
          <Field label="Due date">
            <input
              type="date"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </Field>
          <Field label="Amount (GHS)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Amount paid (GHS)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.amountPaid}
              onChange={(e) =>
                setForm({ ...form, amountPaid: Number(e.target.value) })
              }
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={save}>
            Save invoice
          </button>
        </div>
      </Modal>

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record payment">
        <Field label="Payment amount (GHS)">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
          />
        </Field>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={() => setPayOpen(false)}>
            Cancel
          </button>
          <button type="button" className={btnPrimary} onClick={savePayment}>
            Confirm payment
          </button>
        </div>
      </Modal>
    </div>
  );
}
