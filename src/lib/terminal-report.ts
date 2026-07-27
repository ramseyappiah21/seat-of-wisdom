import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import {
  base64ToUint8Array,
  getClassReportTemplate,
} from "@/lib/report-templates";
import type { ClassLevel, ResultRecord, Student, Term } from "@/lib/types";
import { fullName, totalScore } from "@/lib/utils";

export type TerminalReportMeta = {
  schoolName: string;
  academicYear: string;
};

export type TerminalReportSubjectRow = {
  name: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
};

export function buildTerminalReportData(
  student: Student,
  publishedResults: ResultRecord[],
  meta: TerminalReportMeta,
  term?: Term,
  session?: string
) {
  let rows = publishedResults.filter((r) => r.studentId === student.id);
  if (term) rows = rows.filter((r) => r.term === term);
  if (session) rows = rows.filter((r) => r.session === session);

  if (rows.length === 0) {
    throw new Error("No published results to put in the terminal report.");
  }

  // Prefer one term/session block (most recent by appearance)
  const primary = rows[0];
  const block = rows.filter(
    (r) => r.term === primary.term && r.session === primary.session
  );

  const subjects: TerminalReportSubjectRow[] = block.map((r) => ({
    name: r.subject,
    ca: r.caScore,
    exam: r.examScore,
    total: totalScore(r),
    grade: r.grade,
    remark: r.remark,
  }));

  const rank = block.find((r) => r.classRank != null)?.classRank;

  return {
    school_name: meta.schoolName,
    pupil_name: fullName(student.firstName, student.lastName),
    admission_no: student.admissionNo || "—",
    class: student.classLevel,
    term: primary.term,
    session: primary.session,
    class_rank: rank != null ? String(rank) : "—",
    academic_year: meta.academicYear || primary.session,
    subjects,
  };
}

function triggerDocxDownload(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function fillTerminalReportFromTemplate(
  templateBase64: string,
  data: ReturnType<typeof buildTerminalReportData>
): Uint8Array {
  const zip = new PizZip(base64ToUint8Array(templateBase64));
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{{", end: "}}" },
  });
  doc.render(data);
  return doc.toUint8Array();
}

export function downloadFilledTerminalReport(options: {
  student: Student;
  publishedResults: ResultRecord[];
  meta: TerminalReportMeta;
  classLevel: ClassLevel;
  term?: Term;
  session?: string;
}) {
  const template = getClassReportTemplate(options.classLevel);
  if (!template) {
    throw new Error(
      `No terminal report template uploaded for ${options.classLevel} yet.`
    );
  }

  const data = buildTerminalReportData(
    options.student,
    options.publishedResults,
    options.meta,
    options.term,
    options.session
  );

  const out = fillTerminalReportFromTemplate(template.base64, data);
  const safeName = data.pupil_name.replace(/[^\w\-]+/g, "_");
  const safeAdm = (data.admission_no || "pupil").replace(/[^\w\-]+/g, "_");
  triggerDocxDownload(out, `${safeAdm}-${safeName}-terminal-report.docx`);
}

/** Minimal starter .docx with the required placeholders. */
export function downloadBlankTerminalReportTemplate() {
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>{{school_name}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Terminal Report</w:t></w:r></w:p>
    <w:p><w:r><w:t>Pupil: {{pupil_name}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Admission No: {{admission_no}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Class: {{class}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Term: {{term}} · Session: {{session}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Academic year: {{academic_year}}</w:t></w:r></w:p>
    <w:p><w:r><w:t>Class position: {{class_rank}}</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:t>Subjects</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{#subjects}}{{name}} — CA {{ca}}, Exam {{exam}}, Total {{total}}, Grade {{grade}} ({{remark}})</w:t></w:r></w:p>
    <w:p><w:r><w:t>{{/subjects}}</w:t></w:r></w:p>
    <w:sectPr/>
  </w:body>
</w:document>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const zip = new PizZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.folder("_rels")?.file(".rels", rels);
  zip.folder("word")?.file("document.xml", documentXml);

  const out = zip.generate({ type: "uint8array" });
  triggerDocxDownload(out, "terminal-report-template.docx");
}
