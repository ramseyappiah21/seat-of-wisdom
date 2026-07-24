"use client";

import { HeadmasterNav } from "@/components/HeadmasterNav";
import { Field, PageHeader, btnSecondary, inputClass } from "@/components/ui";
import {
  clearHeadSession,
  hasHeadSession,
  saveHeadSession,
} from "@/lib/portal-auth";
import { useSchool } from "@/lib/store";
import { CLASS_LEVELS, SCHOOL, classToSlug } from "@/lib/types";
import { fullName } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function HeadmasterPortalPage() {
  const { ready, students, teachers } = useSchool();

  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setAuthed(hasHeadSession());
  }, []);

  const classGroups = useMemo(() => {
    return CLASS_LEVELS.map((level) => {
      const subjectTeachers = teachers.filter(
        (t) => t.status === "Active" && t.classes.includes(level)
      );
      const pupilCount = students.filter(
        (s) => s.status === "Active" && s.classLevel === level
      ).length;
      const classTeacher =
        teachers.find((t) => t.homeroomClass === level) ?? null;
      return { level, subjectTeachers, pupilCount, classTeacher };
    });
  }, [teachers, students]);

  if (!ready) return <p className="p-8 text-clay">Loading…</p>;

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (
      user.trim() === SCHOOL.headmasterUser &&
      password === SCHOOL.headmasterPassword
    ) {
      saveHeadSession();
      setAuthed(true);
      setError("");
    } else {
      setError("Invalid headmaster credentials.");
    }
  }

  function logout() {
    clearHeadSession();
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="min-h-[70vh] bg-mist">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <Link href="/portal" className="text-sm font-semibold text-navy hover:underline">
            ← All portals
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-cyan">
            Admin
          </p>
          <h1 className="font-display mt-2 text-4xl text-ink">Headmaster portal</h1>
          <p className="mt-3 max-w-2xl text-clay">
            Open classes, manage all pupils, and assign teachers.
          </p>
          <form
            onSubmit={login}
            className="mt-10 max-w-md space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow)]"
          >
            <Field label="Username">
              <input
                className={inputClass}
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-paper"
            >
              Sign in
            </button>
          </form>
          <p className="mt-4 text-xs text-clay">
            Demo: <strong>{SCHOOL.headmasterUser}</strong> /{" "}
            <strong>{SCHOOL.headmasterPassword}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-mist">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <HeadmasterNav active="classes" />

        <PageHeader
          title="Classes"
          description="Open a class to import pupils, assign teachers, and view that class list. All pupils across the school are on the All pupils tab."
          action={
            <button type="button" className={btnSecondary} onClick={logout}>
              Log out
            </button>
          }
        />

        <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-xl text-ink">Select a class</h2>
          <p className="mt-1 text-sm text-clay">
            Click a class to manage its pupils and teachers.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {classGroups.map(
              ({ level, pupilCount, subjectTeachers, classTeacher }) => (
                <Link
                  key={level}
                  href={`/portal/headmaster/class/${classToSlug(level)}`}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-4 text-left text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-cyan hover:shadow-md"
                >
                  <p className="font-display text-lg">{level}</p>
                  <p className="mt-1 text-xs text-clay">
                    {pupilCount} pupil{pupilCount === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-xs text-navy">
                    {classTeacher
                      ? fullName(
                          classTeacher.firstName,
                          classTeacher.lastName
                        )
                      : "No class teacher"}
                  </p>
                  <p className="mt-0.5 text-xs text-clay">
                    {subjectTeachers.length} subject teacher
                    {subjectTeachers.length === 1 ? "" : "s"}
                  </p>
                </Link>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
