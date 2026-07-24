"use client";

import { BrandMark } from "@/components/marketing/MarketingUI";
import { HeadmasterCredentialsForm } from "@/components/HeadmasterCredentialsForm";
import { Field, btnPrimary, btnSecondary, inputClass } from "@/components/ui";
import {
  downloadBlankSchoolInfoTemplate,
  parseSchoolUpload,
} from "@/lib/school-upload";
import { applyBrandToDocument, writeHeadmasterCreds, writeSetupPassword } from "@/lib/site-config";
import { useSiteConfig } from "@/lib/site-config-provider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SETUP_SESSION = "sow-setup-dashboard-v1";

export default function SchoolSetupDashboard() {
  const {
    config,
    ready,
    setSiteConfig,
    setSetupPassword,
    savePreview,
    exportSiteConfig,
    clearPreview,
    hasPreview,
  } = useSiteConfig();

  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastFile, setLastFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [currentSetupPassword, setCurrentSetupPassword] = useState("");
  const [newSetupPassword, setNewSetupPassword] = useState("");
  const [confirmSetupPassword, setConfirmSetupPassword] = useState("");
  const [setupPwError, setSetupPwError] = useState("");

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(SETUP_SESSION) === "1");
  }, []);

  function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    if (password === config.setupPassword) {
      sessionStorage.setItem(SETUP_SESSION, "1");
      setUnlocked(true);
      setError("");
    } else {
      setError("Wrong password.");
    }
  }

  function changeSetupLogin(e: React.FormEvent) {
    e.preventDefault();
    setSetupPwError("");
    if (currentSetupPassword !== config.setupPassword) {
      setSetupPwError("Current setup password is incorrect.");
      return;
    }
    if (newSetupPassword.length < 6) {
      setSetupPwError("New password must be at least 6 characters.");
      return;
    }
    if (newSetupPassword !== confirmSetupPassword) {
      setSetupPwError("New password and confirmation do not match.");
      return;
    }
    setSetupPassword(newSetupPassword);
    setCurrentSetupPassword("");
    setNewSetupPassword("");
    setConfirmSetupPassword("");
    setMessage(
      "Setup password updated. Use the new password next time you open /setup."
    );
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const next = await parseSchoolUpload(file);
      if (!next.name.trim()) {
        throw new Error("School full name is required in the upload.");
      }
      setSiteConfig(next);
      savePreview(next);
      if (next.headmasterPassword.trim()) {
        writeHeadmasterCreds({
          user: next.headmasterUser || "headmaster",
          password: next.headmasterPassword,
        });
      }
      if (next.setupPassword.trim()) {
        writeSetupPassword(next.setupPassword);
      }
      applyBrandToDocument(next);
      setLastFile(file.name);
      setMessage(
        `Loaded “${next.name}” from ${file.name}. Preview is on in this browser. Download school.json and replace public/school.json, then redeploy for everyone.`
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-mist">
        <div className="mx-auto max-w-md px-4 py-16">
          <Link href="/" className="text-sm font-semibold text-navy hover:underline">
            ← Website
          </Link>
          <h1 className="font-display mt-6 text-3xl text-ink">School setup</h1>
          <p className="mt-2 text-sm text-clay">
            Developer access only. Enter the setup password to continue.
          </p>
          <form onSubmit={unlock} className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
            <Field label="Setup password">
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!ready}
              />
            </Field>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <button type="submit" className={`${btnPrimary} w-full`} disabled={!ready}>
              Open setup dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="border-b border-[var(--line)] bg-navy text-paper">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark tone="light" size="sm" />
            <div>
              <p className="font-display text-lg">School setup</p>
              <p className="text-xs text-cyan-soft">Upload school information</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-sky hover:text-paper">
            View website
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="font-display text-xl text-ink">Change setup password</h2>
          <p className="mt-2 text-sm text-clay">
            This password only unlocks <code className="text-navy">/setup</code>.
            It is separate from the headmaster portal password.
          </p>
          <form onSubmit={changeSetupLogin} className="mt-5 space-y-4">
            <Field label="Current setup password">
              <input
                type="password"
                className={inputClass}
                value={currentSetupPassword}
                onChange={(e) => setCurrentSetupPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            <Field label="New setup password">
              <input
                type="password"
                className={inputClass}
                value={newSetupPassword}
                onChange={(e) => setNewSetupPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            <Field label="Confirm new setup password">
              <input
                type="password"
                className={inputClass}
                value={confirmSetupPassword}
                onChange={(e) => setConfirmSetupPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            {setupPwError ? (
              <p className="text-sm text-danger">{setupPwError}</p>
            ) : null}
            <button type="submit" className={btnPrimary}>
              Save setup password
            </button>
          </form>
        </section>

        <h1 className="font-display mt-10 text-3xl text-ink sm:text-4xl">
          Load a school’s details
        </h1>
        <p className="mt-3 text-clay">
          When you receive the school’s information, upload it here. No need to
          type every field by hand.
        </p>

        <ol className="mt-8 space-y-3 text-sm text-clay">
          <li className="flex gap-3">
            <span className="font-display text-lg text-cyan">1</span>
            Download the blank template and fill in the school’s details (or use
            a full <code className="text-navy">school.json</code>).
          </li>
          <li className="flex gap-3">
            <span className="font-display text-lg text-cyan">2</span>
            Upload the filled file below.
          </li>
          <li className="flex gap-3">
            <span className="font-display text-lg text-cyan">3</span>
            Download <code className="text-navy">school.json</code>, put it in{" "}
            <code className="text-navy">public/school.json</code>, and redeploy.
          </li>
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className={btnSecondary}
            onClick={() => downloadBlankSchoolInfoTemplate()}
          >
            Download blank template (CSV)
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              exportSiteConfig();
              setMessage("Downloaded current school.json.");
            }}
          >
            Download current school.json
          </button>
        </div>

        <section className="mt-8 rounded-2xl border-2 border-dashed border-navy/30 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl text-ink">Upload school information</h2>
          <p className="mt-2 text-sm text-clay">
            Accepts <strong>CSV</strong> / <strong>Excel</strong> (from the
            template) or a full <strong>school.json</strong>.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls,.json,text/csv,application/json"
            disabled={busy}
            className="mt-5 block w-full text-sm text-clay file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-paper"
            onChange={(e) => {
              void onUpload(e.target.files?.[0] ?? null);
            }}
          />
          {busy ? (
            <p className="mt-3 text-sm text-clay">Reading file…</p>
          ) : null}
          {lastFile ? (
            <p className="mt-3 text-sm font-medium text-navy">
              Last upload: {lastFile}
            </p>
          ) : null}
        </section>

        {message ? (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              message.toLowerCase().includes("fail") ||
              message.toLowerCase().includes("required") ||
              message.toLowerCase().includes("wrong")
                ? "border border-red-200 bg-red-50 text-red-900"
                : "border border-cyan/30 bg-sky/50 text-navy"
            }`}
          >
            {message}
          </p>
        ) : null}

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="font-display text-xl text-ink">
            Headmaster login
          </h2>
          <p className="mt-2 text-sm text-clay">
            Username and password for the headmaster portal (not for this setup
            page).
          </p>
          <div className="mt-5">
            <HeadmasterCredentialsForm
              note="Changes apply immediately for the headmaster portal on this browser."
              onSaved={setMessage}
            />
          </div>
          <p className="mt-4 text-sm text-clay">
            Current username:{" "}
            <strong className="text-ink">{config.headmasterUser}</strong>
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="font-display text-xl text-ink">
            Headmaster portal
          </h2>
          <p className="mt-2 text-sm text-clay">
            Site settings is an advanced editor. Hide it from the headmaster
            when this school should only use School setup for branding.
          </p>
          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-[var(--line)] text-navy"
              checked={config.showHeadmasterSiteSettings}
              onChange={(e) => {
                const next = {
                  ...config,
                  showHeadmasterSiteSettings: e.target.checked,
                };
                setSiteConfig(next);
                savePreview(next);
                setMessage(
                  e.target.checked
                    ? "Site settings is visible in the headmaster portal."
                    : "Site settings removed from the headmaster portal. Download school.json and redeploy to keep this for everyone."
                );
              }}
            />
            <span>
              <span className="block font-semibold text-ink">
                Show “Site settings” in headmaster portal
              </span>
              <span className="mt-1 block text-sm text-clay">
                Uncheck to remove that tab. School setup stays available at{" "}
                <code className="text-navy">/setup</code>.
              </span>
            </span>
          </label>
        </section>

        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
            Currently loaded
          </p>
          <h2 className="font-display mt-2 text-2xl text-ink">
            {config.name || "(no school name yet)"}
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-clay">Location</dt>
              <dd className="font-medium text-ink">{config.location || "—"}</dd>
            </div>
            <div>
              <dt className="text-clay">Phone</dt>
              <dd className="font-medium text-ink">{config.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-clay">Email</dt>
              <dd className="font-medium text-ink">{config.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-clay">Academic year</dt>
              <dd className="font-medium text-ink">
                {config.academicYear || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-clay">Primary colour</dt>
              <dd className="flex items-center gap-2 font-medium text-ink">
                <span
                  className="inline-block h-4 w-4 rounded border border-[var(--line)]"
                  style={{ background: config.brand.primary }}
                />
                {config.brand.primary}
              </dd>
            </div>
            <div>
              <dt className="text-clay">Preview</dt>
              <dd className="font-medium text-ink">
                {hasPreview ? "On (this browser)" : "Off (using school.json)"}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                exportSiteConfig();
                setMessage(
                  "Downloaded school.json — replace public/school.json and redeploy."
                );
              }}
            >
              Download school.json for deploy
            </button>
            {hasPreview ? (
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  clearPreview();
                  setMessage("Preview cleared.");
                }}
              >
                Clear preview
              </button>
            ) : null}
            <Link href="/" className={`${btnSecondary} inline-flex items-center`}>
              Open website
            </Link>
          </div>
        </section>

        {config.showHeadmasterSiteSettings ? (
          <p className="mt-8 text-sm text-clay">
            Need to tweak wording later? Use{" "}
            <Link
              href="/portal/headmaster/site"
              className="font-semibold text-navy underline"
            >
              Headmaster → Site settings
            </Link>
            .
          </p>
        ) : (
          <p className="mt-8 text-sm text-clay">
            Site settings is hidden from the headmaster. Upload updates here, or
            turn the option above back on if you need the full editor.
          </p>
        )}
      </div>
    </div>
  );
}
