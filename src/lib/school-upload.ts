import {
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
  type SiteConfig,
} from "@/lib/site-config";
import { parseCsvText } from "@/lib/spreadsheet";

/** Simple field labels for the upload spreadsheet (Field | Value). */
export const SCHOOL_INFO_FIELDS: Array<{
  key: string;
  label: string;
  hint?: string;
}> = [
  { key: "name", label: "School full name", hint: "e.g. Green Valley Basic School" },
  { key: "shortName", label: "Short name", hint: "e.g. Green Valley" },
  { key: "type", label: "School type", hint: "e.g. Basic School" },
  { key: "tagline", label: "Tagline" },
  { key: "academicYear", label: "Academic year", hint: "e.g. 2025/2026" },
  { key: "location", label: "Location", hint: "e.g. Kumasi" },
  { key: "area", label: "Area / town" },
  { key: "district", label: "District" },
  { key: "region", label: "Region" },
  { key: "country", label: "Country" },
  { key: "address", label: "Full address" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
  { key: "admissionsEmail", label: "Admissions email" },
  { key: "website", label: "Website URL" },
  { key: "headmasterUser", label: "Headmaster username" },
  { key: "headmasterPassword", label: "Headmaster password" },
  { key: "brand.primary", label: "Primary colour (hex)", hint: "#0b3d7a" },
  { key: "brand.primaryDeep", label: "Primary deep (hex)", hint: "#062648" },
  { key: "brand.accent", label: "Accent colour (hex)", hint: "#00adef" },
  { key: "brand.accentSoft", label: "Accent soft (hex)", hint: "#7dd8f7" },
  { key: "brand.logoInitials", label: "Logo initials", hint: "e.g. GV" },
  { key: "brand.navSubtitle", label: "Nav subtitle", hint: "Basic School · Town" },
  { key: "marketing.homeHeroSupport", label: "Home support sentence" },
  { key: "marketing.aboutHeroDescription", label: "About page description" },
  { key: "marketing.mission", label: "Mission" },
  { key: "marketing.vision", label: "Vision" },
  { key: "marketing.officeHours", label: "Office hours" },
  { key: "marketing.headerLocationLabel", label: "Header location label" },
];

export function buildBlankSchoolInfoCsv(): string {
  const lines = ["Field,Value,Hint"];
  for (const f of SCHOOL_INFO_FIELDS) {
    const hint = (f.hint ?? "").replace(/"/g, '""');
    lines.push(`"${f.label}",,"${hint}"`);
  }
  return lines.join("\n");
}

export function downloadBlankSchoolInfoTemplate() {
  const csv = buildBlankSchoolInfoCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "school-info-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function setByPath(
  target: Record<string, unknown>,
  path: string,
  value: string
) {
  const parts = path.split(".");
  let cur: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function labelToKey(label: string): string | null {
  const n = label.trim().toLowerCase();
  const found = SCHOOL_INFO_FIELDS.find(
    (f) => f.label.toLowerCase() === n || f.key.toLowerCase() === n
  );
  return found?.key ?? null;
}

/** Turn Field/Value rows into a partial SiteConfig. */
export function rowsToSitePartial(rows: string[][]): Record<string, unknown> {
  const partial: Record<string, unknown> = {};
  // Skip header if present
  const start =
    rows[0] &&
    /field|label|key/i.test(rows[0][0] ?? "") &&
    /value/i.test(rows[0][1] ?? "")
      ? 1
      : 0;

  for (let i = start; i < rows.length; i++) {
    const field = (rows[i]?.[0] ?? "").trim();
    const value = (rows[i]?.[1] ?? "").trim();
    if (!field || !value) continue;
    const key = labelToKey(field) ?? (field.includes(".") ? field : null);
    if (!key) continue;
    setByPath(partial, key, value);
  }
  return partial;
}

export async function parseSchoolUpload(file: File): Promise<SiteConfig> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".json")) {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    return mergeSiteConfig(DEFAULT_SITE_CONFIG, parsed);
  }

  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    const text = await file.text();
    const rows = parseCsvText(text);
    const partial = rowsToSitePartial(rows);
    return mergeSiteConfig(DEFAULT_SITE_CONFIG, partial);
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const { readSpreadsheetRows } = await import("@/lib/spreadsheet");
    const rows = await readSpreadsheetRows(file);
    const partial = rowsToSitePartial(rows);
    return mergeSiteConfig(DEFAULT_SITE_CONFIG, partial);
  }

  throw new Error("Use school.json, or the CSV/Excel school-info template.");
}

/** Empty-ish config for starting a new school (keeps marketing structure). */
export function blankSchoolConfig(): SiteConfig {
  return mergeSiteConfig(DEFAULT_SITE_CONFIG, {
    name: "",
    shortName: "",
    location: "",
    area: "",
    district: "",
    region: "",
    country: "Ghana",
    type: "Basic School",
    tagline: "",
    academicYear: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    admissionsEmail: "",
    website: "",
    headmasterUser: "headmaster",
    headmasterPassword: "",
    brand: {
      ...DEFAULT_SITE_CONFIG.brand,
      logoInitials: "",
      navSubtitle: "Basic School",
    },
    marketing: {
      ...DEFAULT_SITE_CONFIG.marketing,
      homeHeroSupport: "",
      aboutHeroDescription: "",
      mission: "",
      vision: "",
      headerLocationLabel: "",
      newsPosts: [],
    },
  });
}
