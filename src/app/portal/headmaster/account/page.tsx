"use client";

import { HeadmasterCredentialsForm } from "@/components/HeadmasterCredentialsForm";
import { HeadmasterNav } from "@/components/HeadmasterNav";
import { PageHeader, btnSecondary } from "@/components/ui";
import {
  clearHeadSession,
  hasHeadSession,
} from "@/lib/portal-auth";
import { useSiteConfig } from "@/lib/site-config-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HeadmasterAccountPage() {
  const router = useRouter();
  const { config, exportSiteConfig } = useSiteConfig();
  const [authed, setAuthed] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (!hasHeadSession()) {
      router.replace("/portal/headmaster");
      return;
    }
    setAuthed(true);
  }, [router]);

  if (!authed) {
    return <p className="p-8 text-clay">Loading…</p>;
  }

  return (
    <div className="min-h-[70vh] bg-mist">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <HeadmasterNav active="account" />

        <PageHeader
          title="Account"
          description="Change the headmaster username and password used for this portal and School setup."
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

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <p className="mb-4 text-sm text-clay">
            Signed in as <strong className="text-ink">{config.headmasterUser}</strong>.
          </p>
          <HeadmasterCredentialsForm
            requireCurrentPassword
            note="After saving, use Download school.json below so the live site keeps the new password after redeploy."
            onSaved={setFlash}
          />
          {flash ? (
            <p className="mt-4 rounded-xl border border-cyan/30 bg-sky/50 px-4 py-3 text-sm text-navy">
              {flash}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                exportSiteConfig();
                setFlash("Downloaded school.json with the current credentials.");
              }}
            >
              Download school.json
            </button>
            <Link
              href="/portal/headmaster"
              className={`${btnSecondary} inline-flex items-center`}
            >
              Back to classes
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
