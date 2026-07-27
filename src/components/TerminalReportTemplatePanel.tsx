"use client";

import { Field, btnPrimary, btnSecondary } from "@/components/ui";
import {
  REPORT_PLACEHOLDER_HELP,
  fileToBase64,
  getClassReportTemplate,
  removeClassReportTemplate,
  setClassReportTemplate,
  type ClassReportTemplate,
} from "@/lib/report-templates";
import { downloadBlankTerminalReportTemplate } from "@/lib/terminal-report";
import type { ClassLevel } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

export function TerminalReportTemplatePanel({
  classLevel,
  onMessage,
}: {
  classLevel: ClassLevel;
  onMessage?: (message: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [template, setTemplate] = useState<ClassReportTemplate | null>(null);
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setTemplate(getClassReportTemplate(classLevel));
  }, [classLevel]);

  async function onUpload(file: File | null) {
    if (!file) return;
    if (!/\.docx$/i.test(file.name)) {
      onMessage?.("Please upload a Word .docx file.");
      return;
    }
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      const next: ClassReportTemplate = {
        fileName: file.name,
        base64,
        updatedAt: new Date().toISOString(),
      };
      setClassReportTemplate(classLevel, next);
      setTemplate(next);
      onMessage?.(
        `Terminal report template saved for ${classLevel}: ${file.name}`
      );
    } catch (err) {
      onMessage?.(
        err instanceof Error ? err.message : "Could not upload template."
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onRemove() {
    removeClassReportTemplate(classLevel);
    setTemplate(null);
    onMessage?.(`Removed terminal report template for ${classLevel}.`);
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-display text-xl text-ink">Terminal report template</h2>
      <p className="mt-2 text-sm text-clay">
        Upload a Word <strong>.docx</strong> form for{" "}
        <strong>{classLevel}</strong>. The system fills pupil results into it
        automatically. Pupils download their own filled report from the student
        portal after results are published.
      </p>

      {template ? (
        <p className="mt-3 text-sm text-navy">
          Current file: <strong>{template.fileName}</strong>
          <span className="text-clay">
            {" "}
            · updated {new Date(template.updatedAt).toLocaleString()}
          </span>
        </p>
      ) : (
        <p className="mt-3 text-sm text-clay">No template uploaded yet.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <label className={`${btnPrimary} cursor-pointer`}>
          {busy ? "Uploading…" : template ? "Replace .docx" : "Upload .docx"}
          <input
            ref={fileRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              void onUpload(e.target.files?.[0] ?? null);
            }}
          />
        </label>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => downloadBlankTerminalReportTemplate()}
        >
          Download blank template
        </button>
        {template ? (
          <button type="button" className={btnSecondary} onClick={onRemove}>
            Remove template
          </button>
        ) : null}
        <button
          type="button"
          className={btnSecondary}
          onClick={() => setShowHelp((v) => !v)}
        >
          {showHelp ? "Hide placeholders" : "Show placeholders"}
        </button>
      </div>

      {showHelp ? (
        <Field label="Placeholders to put in your Word document">
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-clay">
            {REPORT_PLACEHOLDER_HELP.map((line) => (
              <li key={line}>
                <code className="text-navy">{line.split(" — ")[0]}</code>
                {line.includes(" — ") ? ` — ${line.split(" — ").slice(1).join(" — ")}` : null}
              </li>
            ))}
          </ul>
        </Field>
      ) : null}
    </section>
  );
}
