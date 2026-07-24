import type { FeeStatus, ResultRecord } from "./types";

export function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Random portal password (no names). Avoids ambiguous characters.
 * Retries until unique among existing passwords.
 */
const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePortalPassword(
  existingPasswords: Iterable<string | undefined> = [],
  length = 6
) {
  const used = new Set(
    [...existingPasswords]
      .filter((p): p is string => Boolean(p?.trim()))
      .map((p) => p.trim().toUpperCase())
  );

  for (let attempt = 0; attempt < 40; attempt += 1) {
    let password = "";
    for (let i = 0; i < length; i += 1) {
      password += PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)];
    }
    if (!used.has(password)) return password;
  }

  // Extremely unlikely fallback
  return `${PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)]}${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

/** Empty, legacy name-based (SOW-…), or old numeric serial passwords. */
export function needsPasswordMigration(password: string | undefined) {
  if (!password?.trim()) return true;
  const p = password.trim();
  if (/^SOW-/i.test(p)) return true;
  const n = Number(p);
  if (Number.isInteger(n) && n >= 100000 && String(n) === p) return true;
  return false;
}

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function parseFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().replace(/\s+/g, " ").split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function fullName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function totalScore(result: Pick<ResultRecord, "caScore" | "examScore">) {
  return result.caScore + result.examScore;
}

/**
 * Competition ranking: equal totals share a position; next rank skips
 * (e.g. 1, 2, 2, 4). Higher total ranks first.
 */
export function rankByTotal(
  entries: Array<{ id: string; total: number }>
): Map<string, number> {
  const sorted = [...entries].sort((a, b) => b.total - a.total);
  const ranks = new Map<string, number>();
  let i = 0;
  while (i < sorted.length) {
    const score = sorted[i].total;
    let j = i;
    while (j < sorted.length && sorted[j].total === score) j += 1;
    const rank = i + 1;
    for (let k = i; k < j; k += 1) ranks.set(sorted[k].id, rank);
    i = j;
  }
  return ranks;
}

/** Sum subject totals per pupil, then assign overall class positions. */
export function computeClassRanks(
  results: Array<Pick<ResultRecord, "studentId" | "caScore" | "examScore">>
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const r of results) {
    totals.set(r.studentId, (totals.get(r.studentId) ?? 0) + totalScore(r));
  }
  return rankByTotal(
    [...totals.entries()].map(([id, total]) => ({ id, total }))
  );
}

/** Ghana stanine-style grades (1 highest – 9 lowest), used at basic level / BECE. */
export function computeGrade(total: number): { grade: string; remark: string } {
  if (total >= 80) return { grade: "1", remark: "Highest" };
  if (total >= 70) return { grade: "2", remark: "Higher" };
  if (total >= 60) return { grade: "3", remark: "High" };
  if (total >= 55) return { grade: "4", remark: "High Average" };
  if (total >= 50) return { grade: "5", remark: "Average" };
  if (total >= 45) return { grade: "6", remark: "Low Average" };
  if (total >= 40) return { grade: "7", remark: "Low" };
  if (total >= 35) return { grade: "8", remark: "Lower" };
  return { grade: "9", remark: "Lowest" };
}

export function deriveFeeStatus(
  amount: number,
  amountPaid: number,
  dueDate: string
): FeeStatus {
  if (amountPaid >= amount) return "Paid";
  if (amountPaid > 0) return "Partial";
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return "Overdue";
  return "Unpaid";
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}
