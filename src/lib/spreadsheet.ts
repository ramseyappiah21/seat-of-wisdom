/** Spreadsheet helpers for class lists and results (Excel + CSV). */

type XlsxModule = typeof import("xlsx");

function getXlsx(mod: XlsxModule | { default: XlsxModule }): XlsxModule {
  const m = mod as XlsxModule & { default?: XlsxModule };
  return m.default ?? m;
}

/** Minimal CSV parser (handles quotes, commas, semicolons). */
export function parseCsvText(text: string): string[][] {
  const cleaned = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === "," || ch === ";" || ch === "\t") {
      row.push(cell.trim());
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c.length > 0)) rows.push(row);
      row = [];
    } else if (ch !== "\r") {
      cell += ch;
    }
  }

  row.push(cell.trim());
  if (row.some((c) => c.length > 0)) rows.push(row);
  return rows;
}

function isCsvFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".csv") ||
    name.endsWith(".txt") ||
    file.type === "text/csv" ||
    file.type === "text/plain"
  );
}

function sheetToStringRows(
  XLSX: XlsxModule,
  sheet: import("xlsx").WorkSheet
): string[][] {
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    sheet,
    {
      header: 1,
      defval: "",
      raw: false,
      blankrows: false,
    }
  );

  return rows
    .map((row) => {
      const cells = Array.isArray(row) ? row : [];
      return cells.map((cell) => String(cell ?? "").trim());
    })
    .filter((row) => row.some((cell) => cell.length > 0));
}

/** Count how many person-like names a sheet would yield (for picking the best sheet). */
function estimateNameYield(rows: string[][]): number {
  if (!rows.length) return 0;
  // Lightweight: avoid circular call during module init — use looksLikePersonName on cells
  let count = 0;
  const scan = Math.min(rows.length, 80);
  for (let i = 0; i < scan; i++) {
    const row = rows[i] ?? [];
    if (firstPersonNameInRow(row)) count += 1;
  }
  return count;
}

/** Read first (or best) sheet of a CSV/XLS/XLSX file into string rows. */
export async function readSpreadsheetRows(file: File): Promise<string[][]> {
  if (isCsvFile(file)) {
    const text = await file.text();
    return parseCsvText(text);
  }

  const mod = await import("xlsx");
  const XLSX = getXlsx(mod);
  if (typeof XLSX.read !== "function") {
    throw new Error("Excel library failed to load. Try saving the file as CSV.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    raw: false,
  });
  if (!workbook.SheetNames.length) return [];

  let bestRows: string[][] = [];
  let bestScore = -1;
  let firstNonEmpty: string[][] | null = null;
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rows = sheetToStringRows(XLSX, sheet);
    if (!rows.length) continue;
    if (!firstNonEmpty) firstNonEmpty = rows;
    const score = estimateNameYield(rows);
    // Prefer earlier sheets on a tie (cover sheets usually score 0)
    if (score > bestScore) {
      bestScore = score;
      bestRows = rows;
    }
  }

  return bestScore > 0 ? bestRows : firstNonEmpty ?? [];
}

export type NameResultRow = {
  fullName: string;
  subject?: string;
  caScore: number;
  examScore: number;
};

/** Combined name ready for the Pupil column. */
export type ImportedPupilName = {
  fullName: string;
  firstName: string;
  lastName: string;
  gender?: "Male" | "Female";
};

function normHeader(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[_./\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isFullNameHeader(h: string): boolean {
  return (
    h === "name" ||
    h === "names" ||
    h === "full name" ||
    h === "fullname" ||
    h === "pupil" ||
    h === "pupils" ||
    h === "pupil name" ||
    h === "pupils name" ||
    h === "student" ||
    h === "student name" ||
    h === "learner name" ||
    h.includes("full name") ||
    h.includes("pupil name") ||
    h.includes("student name")
  );
}

function isSurnameHeader(h: string): boolean {
  if (h.includes("other")) return false;
  return (
    h === "surname" ||
    h === "sur name" ||
    h === "last name" ||
    h === "lastname" ||
    h === "family name" ||
    h === "familyname" ||
    h === "last" ||
    h.endsWith(" surname") ||
    h.includes("surname")
  );
}

function isOtherOrFirstNameHeader(h: string): boolean {
  if (isFullNameHeader(h) || isSurnameHeader(h)) return false;
  return (
    h === "other name" ||
    h === "other names" ||
    h === "othername" ||
    h === "othernames" ||
    h === "other" ||
    h === "first name" ||
    h === "firstname" ||
    h === "first names" ||
    h === "given name" ||
    h === "given names" ||
    h === "middle name" ||
    h === "middle names" ||
    h === "forename" ||
    h === "fore name" ||
    h === "christian name" ||
    h.includes("other name") ||
    h.includes("first name") ||
    h.includes("given name") ||
    h.includes("middle name")
  );
}

type NameColumns = {
  fullNameIdx: number;
  surnameIdx: number;
  otherNameIdxs: number[];
};

function detectNameColumns(header: string[]): NameColumns {
  const normalized = header.map(normHeader);
  return {
    fullNameIdx: normalized.findIndex(isFullNameHeader),
    surnameIdx: normalized.findIndex(isSurnameHeader),
    otherNameIdxs: normalized
      .map((h, i) => (isOtherOrFirstNameHeader(h) ? i : -1))
      .filter((i) => i >= 0),
  };
}

function pickNameColumn(header: string[], sampleRows: string[][]): number {
  const detected = detectNameColumns(header);
  if (detected.fullNameIdx >= 0) return detected.fullNameIdx;

  const colCount = Math.max(
    header.length,
    ...sampleRows.map((r) => r.length),
    1
  );
  let bestIdx = 0;
  let bestScore = -1;
  for (let col = 0; col < colCount; col++) {
    const h = normHeader(header[col] || "");
    if (
      h === "no" ||
      h === "s n" ||
      h === "s no" ||
      h === "sn" ||
      h.includes("admission") ||
      h.includes("index") ||
      h === "#"
    ) {
      continue;
    }
    let score = 0;
    for (const r of sampleRows.slice(0, 20)) {
      const v = (r[col] || "").trim();
      if (!v) continue;
      if (Number.isFinite(Number(v)) && v.length < 8) continue;
      score += 1;
      if (v.includes(" ")) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIdx = col;
    }
  }
  return bestIdx;
}

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Map Excel sex/gender cells to Male | Female. */
export function parseGenderCell(value: string): "Male" | "Female" | undefined {
  const v = collapseSpaces(value).toLowerCase();
  if (!v) return undefined;
  if (
    v === "m" ||
    v === "male" ||
    v === "boy" ||
    v === "man" ||
    v === "m." ||
    v.startsWith("male")
  ) {
    return "Male";
  }
  if (
    v === "f" ||
    v === "female" ||
    v === "girl" ||
    v === "woman" ||
    v === "f." ||
    v.startsWith("female")
  ) {
    return "Female";
  }
  return undefined;
}

function findGenderColumn(header: string[]): number {
  return header.findIndex((c) => {
    const h = normHeader(c);
    return h === "gender" || h === "sex" || h === "sex/gender" || h === "gender/sex";
  });
}

const NON_PERSON_PHRASES =
  /\b(university|mines|technology|registered|service year|course of study|computer science|engineering|bachelor|diploma|faculty|department|college|polytechnic|list of|final[- ]year|academic year|programme|program of study|index number|matriculation|nss|ghanaian)\b/i;

function isJunkName(n: string): boolean {
  return (
    !n ||
    /^(name|names|full name|fullname|student|pupil|pupils|admission|surname|other name|other names|first name|last name|course of study|no|s\/no)$/i.test(
      n
    ) ||
    /^\d+(\.\d+)?$/.test(n)
  );
}

/** True only for values that look like a person's name (not titles/courses). */
export function looksLikePersonName(value: string): boolean {
  const n = collapseSpaces(value);
  if (!n || isJunkName(n)) return false;
  if (n.length < 2 || n.length > 60) return false;
  if (NON_PERSON_PHRASES.test(n)) return false;
  if (/^b\.?\s*sc\b/i.test(n) || /^bsc\b/i.test(n) || /^ba\b/i.test(n)) {
    return false;
  }
  // Too many words → likely a sentence/title
  const words = n.split(" ").filter(Boolean);
  if (words.length > 5) return false;
  // Must be mostly letters (allow hyphen/apostrophe)
  if (!/^[a-zA-Z][a-zA-Z\s'.-]*[a-zA-Z.]$|^[a-zA-Z]{2,}$/.test(n)) {
    return false;
  }
  // Reject ALL-CAPS institutional lines, but keep ALL-CAPS pupil names (1–4 words)
  const letters = n.replace(/[^a-zA-Z]/g, "");
  if (
    letters.length > 18 &&
    letters === letters.toUpperCase() &&
    words.length > 4
  ) {
    return false;
  }
  // Leading dash often marks a course bullet
  if (n.startsWith("-")) return false;
  return true;
}

/**
 * Prefer a real person name over serial numbers / blank index columns.
 * School lists are often: 1 | Ama Mensah — first cell is not the name.
 * Also handles a single cell like "1. Ama Mensah".
 */
function stripLeadingSerial(value: string): string {
  return collapseSpaces(value)
    .replace(/^\d+\s*[.)\-:]?\s+/, "")
    .replace(/^\d+\t+/, "")
    .trim();
}

function firstPersonNameInRow(row: string[]): string {
  for (const raw of row) {
    const cell = collapseSpaces(raw || "");
    if (!cell) continue;
    if (looksLikePersonName(cell)) return cell;
    const stripped = stripLeadingSerial(cell);
    if (stripped && stripped !== cell && looksLikePersonName(stripped)) {
      return stripped;
    }
  }
  // Last resort: join non-numeric cells (Surname | Other across cols without headers)
  const joined = collapseSpaces(
    row
      .map((c) => collapseSpaces(c || ""))
      .filter((c) => c && !/^\d+(\.\d+)?$/.test(c))
      .join(" ")
  );
  if (looksLikePersonName(joined)) return joined;
  const strippedJoined = stripLeadingSerial(joined);
  if (strippedJoined && looksLikePersonName(strippedJoined)) {
    return strippedJoined;
  }
  return "";
}

function headerRowScore(cells: string[]): number {
  const normalized = cells.map(normHeader);
  const cols = detectNameColumns(normalized);
  let score = 0;
  if (cols.fullNameIdx >= 0) score += 5;
  if (cols.surnameIdx >= 0) score += 6;
  if (cols.otherNameIdxs.length > 0) score += 6;
  if (normalized.some((c) => c.includes("admission") || c.includes("index"))) {
    score += 1;
  }
  if (normalized.some((c) => c === "sex" || c === "gender")) score += 1;
  // Prefer compact header rows over title lines
  if (cells.join(" ").length > 120) score -= 3;
  return score;
}

/** Find the row that is the real column header (may not be row 0). */
function findHeaderRowIndex(rows: string[][]): number {
  let bestIdx = -1;
  let bestScore = 0;
  const scan = Math.min(rows.length, 40);
  for (let i = 0; i < scan; i++) {
    const score = headerRowScore(rows[i] ?? []);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  // Need at least a name-related header
  return bestScore >= 5 ? bestIdx : -1;
}

/**
 * Build one pupil name for the Pupil column:
 * 1) Surname + Other Name / First Name → combine into one
 * 2) Full Name / Name / Pupil → use as-is
 * Also reads Gender / Sex when that column exists.
 */
export function rowToPupilName(
  row: string[],
  header: string[],
  fallbackNameIdx: number
): ImportedPupilName | null {
  const cols = detectNameColumns(header);
  const genderIdx = findGenderColumn(header);
  const gender =
    genderIdx >= 0 ? parseGenderCell(row[genderIdx] || "") : undefined;
  const hasSplit = cols.surnameIdx >= 0 || cols.otherNameIdxs.length > 0;

  if (hasSplit) {
    const otherParts = cols.otherNameIdxs
      .map((i) => (row[i] || "").trim())
      .filter(Boolean);
    const surname =
      cols.surnameIdx >= 0 ? (row[cols.surnameIdx] || "").trim() : "";
    const otherName = collapseSpaces(otherParts.join(" "));
    const sur = collapseSpaces(surname);

    if (otherName || sur) {
      if (otherName && !looksLikePersonName(otherName) && otherName.length > 20) {
        return null;
      }
      if (sur && !looksLikePersonName(sur) && sur.length > 20) {
        return null;
      }
      const firstName = otherName || sur;
      const lastName = otherName ? sur : "";
      const fullName = collapseSpaces(
        [otherName, sur].filter(Boolean).join(" ")
      );
      if (!looksLikePersonName(fullName)) return null;
      return { fullName, firstName, lastName, gender };
    }
  }

  if (cols.fullNameIdx >= 0) {
    const v = collapseSpaces(row[cols.fullNameIdx] || "");
    if (v && looksLikePersonName(v)) {
      const parts = v.split(" ");
      return {
        fullName: v,
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
        gender,
      };
    }
    return null;
  }

  if (header.length === 0) return null;

  const fallback =
    firstPersonNameInRow(row) ||
    collapseSpaces((row[fallbackNameIdx] || row[0] || "").trim());
  if (!looksLikePersonName(fallback)) return null;
  const parts = fallback.split(" ");
  return {
    fullName: fallback,
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    gender,
  };
}

export function rowToFullName(
  row: string[],
  header: string[],
  fallbackNameIdx: number
): string {
  return rowToPupilName(row, header, fallbackNameIdx)?.fullName ?? "";
}

/** Detect header row and parse names into Pupil entries (or name+scores). */
export function parseImportRows(rows: string[][]): {
  mode: "names" | "results";
  names: string[];
  pupils: ImportedPupilName[];
  results: NameResultRow[];
} {
  if (rows.length === 0) {
    return { mode: "names", names: [], pupils: [], results: [] };
  }

  const headerIdx = findHeaderRowIndex(rows);
  const header =
    headerIdx >= 0 ? rows[headerIdx].map((c) => normHeader(c)) : [];
  const dataRows = headerIdx >= 0 ? rows.slice(headerIdx + 1) : rows;

  // Headerless sheet: first person-like cell per row (skip S/N, blank cols)
  if (header.length === 0) {
    const pupils: ImportedPupilName[] = [];
    for (const r of dataRows) {
      const cell = firstPersonNameInRow(r);
      if (!cell) continue;
      const parts = cell.split(" ");
      pupils.push({
        fullName: cell,
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
      });
    }
    return {
      mode: "names",
      names: pupils.map((p) => p.fullName),
      pupils,
      results: [],
    };
  }

  const nameIdx = pickNameColumn(header, dataRows);
  const nameCols = detectNameColumns(header);

  // Must have Full Name / Name OR Surname / Other Name columns
  const hasNameCols =
    nameCols.fullNameIdx >= 0 ||
    nameCols.surnameIdx >= 0 ||
    nameCols.otherNameIdxs.length > 0;
  if (!hasNameCols) {
    // Header found but not name-labelled — still try best column / first person cell
    const pupils: ImportedPupilName[] = [];
    for (const r of dataRows) {
      const pupil = rowToPupilName(r, header, nameIdx);
      if (!pupil) {
        const cell =
          firstPersonNameInRow(r) ||
          collapseSpaces((r[nameIdx] || "").trim());
        if (!looksLikePersonName(cell)) continue;
        const parts = cell.split(" ");
        pupils.push({
          fullName: cell,
          firstName: parts[0],
          lastName: parts.slice(1).join(" "),
        });
        continue;
      }
      pupils.push(pupil);
    }
    return {
      mode: "names",
      names: pupils.map((p) => p.fullName),
      pupils,
      results: [],
    };
  }

  const subjectIdx = header.findIndex((c) => c.includes("subject"));
  const caIdx = header.findIndex(
    (c) =>
      c === "ca" ||
      c.includes("class exercise") ||
      c.includes("continuous") ||
      c.includes("class score")
  );
  const examIdx = header.findIndex(
    (c) => c.includes("exam") || c === "ex" || c.includes("test")
  );
  const hasScores = caIdx >= 0 || examIdx >= 0;

  const pupils: ImportedPupilName[] = [];
  for (const r of dataRows) {
    const pupil = rowToPupilName(r, header, nameIdx);
    if (!pupil) continue;
    pupils.push(pupil);
  }

  if (!hasScores) {
    return {
      mode: "names",
      names: pupils.map((p) => p.fullName),
      pupils,
      results: [],
    };
  }

  const results: NameResultRow[] = [];
  for (const r of dataRows) {
    const pupil = rowToPupilName(r, header, nameIdx);
    if (!pupil) continue;

    let subject: string | undefined;
    let caScore = 0;
    let examScore = 0;

    const scoreFallbackStart =
      nameCols.surnameIdx >= 0 || nameCols.otherNameIdxs.length > 0
        ? Math.max(
            nameCols.surnameIdx,
            ...nameCols.otherNameIdxs,
            nameCols.fullNameIdx,
            0
          ) + 1
        : 1;

    if (subjectIdx >= 0 || (r.length >= 4 && Number.isNaN(Number(r[1])))) {
      subject = (subjectIdx >= 0 ? r[subjectIdx] : r[1]) || undefined;
      caScore = Number(caIdx >= 0 ? r[caIdx] : r[2]) || 0;
      examScore = Number(examIdx >= 0 ? r[examIdx] : r[3]) || 0;
    } else {
      caScore = Number(caIdx >= 0 ? r[caIdx] : r[scoreFallbackStart]) || 0;
      examScore =
        Number(examIdx >= 0 ? r[examIdx] : r[scoreFallbackStart + 1]) || 0;
    }

    results.push({
      fullName: pupil.fullName,
      subject,
      caScore,
      examScore,
    });
  }

  return {
    mode: "results",
    names: results.map((r) => r.fullName),
    pupils,
    results,
  };
}

/** Download rows as .xlsx (fallback .csv if Excel lib fails). */
export async function downloadSpreadsheet(
  filename: string,
  rows: Array<Array<string | number | null | undefined>>,
  sheetName = "Sheet1"
) {
  const safeRows = rows.map((row) =>
    row.map((cell) => (cell == null ? "" : cell))
  );
  const base = filename.replace(/\.(xlsx|csv)$/i, "");

  const triggerDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  try {
    const mod = await import("xlsx");
    const XLSX = getXlsx(mod);
    if (typeof XLSX.utils?.aoa_to_sheet !== "function") {
      throw new Error("Excel export unavailable");
    }
    const worksheet = XLSX.utils.aoa_to_sheet(safeRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    }) as Uint8Array;
    const bytes = new Uint8Array(buffer);
    triggerDownload(
      new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${base}.xlsx`
    );
  } catch (err) {
    console.warn("Excel export failed, falling back to CSV.", err);
    const csv = safeRows
      .map((row) =>
        row
          .map((cell) => {
            const text = String(cell);
            if (/[",\n\r]/.test(text)) {
              return `"${text.replace(/"/g, '""')}"`;
            }
            return text;
          })
          .join(",")
      )
      .join("\r\n");
    triggerDownload(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `${base}.csv`
    );
  }
}
