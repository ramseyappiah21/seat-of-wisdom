import type { ClassLevel } from "@/lib/types";

export const REPORT_TEMPLATES_KEY = "sow-class-report-templates-v1";

export type ClassReportTemplate = {
  fileName: string;
  /** Base64-encoded .docx bytes */
  base64: string;
  updatedAt: string;
};

export type ReportTemplateMap = Partial<
  Record<ClassLevel, ClassReportTemplate>
>;

export function readReportTemplates(): ReportTemplateMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(REPORT_TEMPLATES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ReportTemplateMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeReportTemplates(map: ReportTemplateMap) {
  localStorage.setItem(REPORT_TEMPLATES_KEY, JSON.stringify(map));
}

export function getClassReportTemplate(
  classLevel: ClassLevel
): ClassReportTemplate | null {
  return readReportTemplates()[classLevel] ?? null;
}

export function setClassReportTemplate(
  classLevel: ClassLevel,
  template: ClassReportTemplate
) {
  const map = readReportTemplates();
  map[classLevel] = template;
  writeReportTemplates(map);
}

export function removeClassReportTemplate(classLevel: ClassLevel) {
  const map = readReportTemplates();
  delete map[classLevel];
  writeReportTemplates(map);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file."));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const REPORT_PLACEHOLDER_HELP = [
  "{{school_name}} — school name",
  "{{pupil_name}} — pupil full name",
  "{{admission_no}} — admission number",
  "{{class}} — class level",
  "{{term}} — term",
  "{{session}} — academic session",
  "{{class_rank}} — overall class position",
  "{{academic_year}} — academic year",
  "{#subjects} … {/subjects} — repeat once per subject",
  "Inside subjects: {{name}}, {{ca}}, {{exam}}, {{total}}, {{grade}}, {{remark}}",
] as const;
