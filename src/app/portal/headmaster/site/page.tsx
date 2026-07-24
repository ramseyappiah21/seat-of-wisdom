"use client";

import { HeadmasterNav } from "@/components/HeadmasterNav";
import { Field, PageHeader, btnPrimary, btnSecondary, inputClass } from "@/components/ui";
import {
  clearHeadSession,
  hasHeadSession,
} from "@/lib/portal-auth";
import { applyBrandToDocument } from "@/lib/site-config";
import { useSiteConfig } from "@/lib/site-config-provider";
import type { SiteConfig, SiteNewsPost, SiteStage, SiteValue } from "@/lib/site-config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function SiteSettingsPage() {
  const router = useRouter();
  const {
    config,
    ready,
    hasPreview,
    setSiteConfig,
    savePreview,
    clearPreview,
    resetSiteConfig,
    importSiteConfig,
    clearSchoolData,
  } = useSiteConfig();

  const [authed, setAuthed] = useState(false);
  const [draft, setDraft] = useState<SiteConfig>(config);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (!hasHeadSession()) {
      router.replace("/portal/headmaster");
      return;
    }
    setAuthed(true);
  }, [router]);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  if (!ready || !authed) {
    return <p className="p-8 text-clay">Loading…</p>;
  }

  function patch<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function patchBrand(key: keyof SiteConfig["brand"], value: string) {
    setDraft((d) => ({ ...d, brand: { ...d.brand, [key]: value } }));
  }

  function patchMarketing<K extends keyof SiteConfig["marketing"]>(
    key: K,
    value: SiteConfig["marketing"][K]
  ) {
    setDraft((d) => ({
      ...d,
      marketing: { ...d.marketing, [key]: value },
    }));
  }

  function handleApply() {
    setSiteConfig(draft);
    savePreview(draft);
    applyBrandToDocument(draft);
    setFlash(
      "Applied to this browser. Download school.json and replace public/school.json, then redeploy for all visitors."
    );
  }

  function handleDownload() {
    setSiteConfig(draft);
    savePreview(draft);
    applyBrandToDocument(draft);
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "school.json";
    a.click();
    URL.revokeObjectURL(url);
    setFlash("Downloaded school.json — replace public/school.json and redeploy.");
  }

  return (
    <div className="min-h-[70vh] bg-mist">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <HeadmasterNav active="site" />

        <PageHeader
          title="Site settings"
          description="Customise this school’s name, colours, contact details, and website copy. Download school.json for a permanent deploy."
          action={
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                clearHeadSession();
                router.replace("/portal/headmaster");
              }}
            >
              Log out
            </button>
          }
        />

        {flash ? (
          <p className="mb-4 rounded-xl bg-sky/60 px-4 py-3 text-sm text-navy">
            {flash}
          </p>
        ) : null}

        {hasPreview ? (
          <p className="mb-4 rounded-xl border border-cyan/40 bg-white px-4 py-3 text-sm text-clay">
            Preview mode is on (local overrides).{" "}
            <button
              type="button"
              className="font-semibold text-navy underline"
              onClick={() => {
                clearPreview();
                setFlash("Preview cleared — showing public/school.json.");
              }}
            >
              Clear preview
            </button>
          </p>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} onClick={handleApply}>
            Apply &amp; preview
          </button>
          <button type="button" className={btnSecondary} onClick={handleDownload}>
            Download school.json
          </button>
          <label className={`${btnSecondary} cursor-pointer`}>
            Import school.json
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void importSiteConfig(file).then(() => {
                  setFlash(`Imported ${file.name}.`);
                  e.target.value = "";
                });
              }}
            />
          </label>
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              if (confirm("Reset site settings to Seat of Wisdom defaults?")) {
                resetSiteConfig();
                setFlash("Reset to defaults.");
              }
            }}
          >
            Reset defaults
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={() => {
              if (
                confirm(
                  "Clear pupil/teacher data in this browser? Site settings are kept."
                )
              ) {
                clearSchoolData();
              }
            }}
          >
            Clear school data
          </button>
        </div>

        <div className="space-y-6">
          <Section title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Full school name"],
                  ["shortName", "Short name"],
                  ["type", "School type"],
                  ["tagline", "Tagline"],
                  ["academicYear", "Academic year"],
                  ["location", "Location"],
                  ["area", "Area / town"],
                  ["district", "District"],
                  ["region", "Region"],
                  ["country", "Country"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    className={inputClass}
                    value={draft[key]}
                    onChange={(e) => patch(key, e.target.value)}
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Brand colours">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["primary", "Primary (navy)"],
                  ["primaryDeep", "Primary deep"],
                  ["accent", "Accent (cyan)"],
                  ["accentSoft", "Accent soft"],
                  ["logoInitials", "Logo initials"],
                  ["navSubtitle", "Nav subtitle"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <div className="flex gap-2">
                    {key.includes("primary") || key.includes("accent") ? (
                      <input
                        type="color"
                        className="h-11 w-14 rounded-lg border border-[var(--line)]"
                        value={draft.brand[key]}
                        onChange={(e) => patchBrand(key, e.target.value)}
                      />
                    ) : null}
                    <input
                      className={inputClass}
                      value={draft.brand[key]}
                      onChange={(e) => patchBrand(key, e.target.value)}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["address", "Address"],
                  ["phone", "Phone"],
                  ["whatsapp", "WhatsApp"],
                  ["email", "Email"],
                  ["admissionsEmail", "Admissions email"],
                  ["website", "Website URL"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label} className={key === "address" ? "sm:col-span-2" : ""}>
                  <input
                    className={inputClass}
                    value={draft[key]}
                    onChange={(e) => patch(key, e.target.value)}
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section title="Headmaster login">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Username">
                <input
                  className={inputClass}
                  value={draft.headmasterUser}
                  onChange={(e) => patch("headmasterUser", e.target.value)}
                />
              </Field>
              <Field label="Password">
                <input
                  className={inputClass}
                  value={draft.headmasterPassword}
                  onChange={(e) => patch("headmasterPassword", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section title="Homepage & about copy">
            {(
              [
                ["homeHeroSupport", "Home hero support line"],
                ["homeAboutTitle", "Home about title"],
                ["homeAboutBlurb", "Home about blurb"],
                ["homeExploreTitle", "Home explore title"],
                ["homeExploreBlurb", "Home explore blurb"],
                ["aboutHeroDescription", "About hero description"],
                ["aboutStoryTitle", "About story title"],
                ["aboutStoryIntro", "About story intro"],
                ["aboutStoryBody1", "About body 1"],
                ["aboutStoryBody2", "About body 2"],
                ["aboutWelcome", "Welcome word"],
                ["mission", "Mission"],
                ["vision", "Vision"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <textarea
                  className={inputClass}
                  rows={key.includes("Body") || key === "mission" || key === "vision" ? 3 : 2}
                  value={draft.marketing[key]}
                  onChange={(e) => patchMarketing(key, e.target.value)}
                />
              </Field>
            ))}
          </Section>

          <Section title="Values (one per block)">
            {draft.marketing.values.map((v, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <Field label={`Value ${i + 1} title`}>
                  <input
                    className={inputClass}
                    value={v.title}
                    onChange={(e) => {
                      const values = [...draft.marketing.values] as SiteValue[];
                      values[i] = { ...values[i], title: e.target.value };
                      patchMarketing("values", values);
                    }}
                  />
                </Field>
                <Field label="Text">
                  <input
                    className={inputClass}
                    value={v.text}
                    onChange={(e) => {
                      const values = [...draft.marketing.values] as SiteValue[];
                      values[i] = { ...values[i], text: e.target.value };
                      patchMarketing("values", values);
                    }}
                  />
                </Field>
              </div>
            ))}
          </Section>

          <Section title="Academics">
            {(
              [
                ["academicsHeroTitle", "Hero title"],
                ["academicsHeroDescription", "Hero description"],
                ["academicsPathwaysTitle", "Pathways title"],
                ["academicsPathwaysBlurb", "Pathways blurb"],
                ["academicsEssenceTitle", "Essence title"],
                ["academicsEssenceBody", "Essence body"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={draft.marketing[key]}
                  onChange={(e) => patchMarketing(key, e.target.value)}
                />
              </Field>
            ))}
            {draft.marketing.stages.map((s, i) => (
              <div key={i} className="grid gap-2 border-t border-[var(--line)] pt-4 sm:grid-cols-3">
                <Field label={`Stage ${i + 1} title`}>
                  <input
                    className={inputClass}
                    value={s.title}
                    onChange={(e) => {
                      const stages = [...draft.marketing.stages] as SiteStage[];
                      stages[i] = { ...stages[i], title: e.target.value };
                      patchMarketing("stages", stages);
                    }}
                  />
                </Field>
                <Field label="Ages">
                  <input
                    className={inputClass}
                    value={s.ages}
                    onChange={(e) => {
                      const stages = [...draft.marketing.stages] as SiteStage[];
                      stages[i] = { ...stages[i], ages: e.target.value };
                      patchMarketing("stages", stages);
                    }}
                  />
                </Field>
                <Field label="Text">
                  <input
                    className={inputClass}
                    value={s.text}
                    onChange={(e) => {
                      const stages = [...draft.marketing.stages] as SiteStage[];
                      stages[i] = { ...stages[i], text: e.target.value };
                      patchMarketing("stages", stages);
                    }}
                  />
                </Field>
              </div>
            ))}
          </Section>

          <Section title="Admissions">
            {(
              [
                ["admissionsHeroTitle", "Hero title"],
                ["admissionsHeroDescription", "Hero description"],
                ["admissionsStepsTitle", "Steps title"],
                ["admissionsStepsBlurb", "Steps blurb"],
                ["admissionsDocsTitle", "Documents title"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  className={inputClass}
                  value={draft.marketing[key]}
                  onChange={(e) => patchMarketing(key, e.target.value)}
                />
              </Field>
            ))}
            <Field label="Steps (one per line)">
              <textarea
                className={inputClass}
                rows={5}
                value={draft.marketing.admissionsSteps.join("\n")}
                onChange={(e) =>
                  patchMarketing(
                    "admissionsSteps",
                    e.target.value.split("\n").map((l) => l.trim()).filter(Boolean)
                  )
                }
              />
            </Field>
            <Field label="Documents (one per line)">
              <textarea
                className={inputClass}
                rows={4}
                value={draft.marketing.admissionsDocs.join("\n")}
                onChange={(e) =>
                  patchMarketing(
                    "admissionsDocs",
                    e.target.value.split("\n").map((l) => l.trim()).filter(Boolean)
                  )
                }
              />
            </Field>
          </Section>

          <Section title="News">
            {(
              [
                ["newsHeroTitle", "Hero title"],
                ["newsHeroDescription", "Hero description"],
                ["newsSectionTitle", "Section title"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  className={inputClass}
                  value={draft.marketing[key]}
                  onChange={(e) => patchMarketing(key, e.target.value)}
                />
              </Field>
            ))}
            {draft.marketing.newsPosts.map((p, i) => (
              <div key={i} className="space-y-2 border-t border-[var(--line)] pt-4">
                <p className="text-xs font-semibold text-clay">Post {i + 1}</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Field label="Date">
                    <input
                      className={inputClass}
                      value={p.date}
                      onChange={(e) => {
                        const newsPosts = [
                          ...draft.marketing.newsPosts,
                        ] as SiteNewsPost[];
                        newsPosts[i] = { ...newsPosts[i], date: e.target.value };
                        patchMarketing("newsPosts", newsPosts);
                      }}
                    />
                  </Field>
                  <Field label="Title" className="sm:col-span-2">
                    <input
                      className={inputClass}
                      value={p.title}
                      onChange={(e) => {
                        const newsPosts = [
                          ...draft.marketing.newsPosts,
                        ] as SiteNewsPost[];
                        newsPosts[i] = { ...newsPosts[i], title: e.target.value };
                        patchMarketing("newsPosts", newsPosts);
                      }}
                    />
                  </Field>
                </div>
                <Field label="Excerpt">
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={p.excerpt}
                    onChange={(e) => {
                      const newsPosts = [
                        ...draft.marketing.newsPosts,
                      ] as SiteNewsPost[];
                      newsPosts[i] = { ...newsPosts[i], excerpt: e.target.value };
                      patchMarketing("newsPosts", newsPosts);
                    }}
                  />
                </Field>
              </div>
            ))}
          </Section>

          <Section title="Contact page">
            {(
              [
                ["contactHeroTitle", "Hero title"],
                ["contactHeroDescription", "Hero description"],
                ["officeHours", "Office hours"],
                ["headerLocationLabel", "Header location label"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  className={inputClass}
                  value={draft.marketing[key]}
                  onChange={(e) => patchMarketing(key, e.target.value)}
                />
              </Field>
            ))}
          </Section>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} onClick={handleApply}>
            Apply &amp; preview
          </button>
          <button type="button" className={btnSecondary} onClick={handleDownload}>
            Download school.json
          </button>
          <Link href="/" className={`${btnSecondary} inline-flex items-center`}>
            View website
          </Link>
        </div>
      </div>
    </div>
  );
}
