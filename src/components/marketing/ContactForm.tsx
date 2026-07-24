"use client";

import { Field, inputClass } from "@/components/ui";
import { SCHOOL } from "@/lib/types";
import { useState, type FormEvent } from "react";

type Mode = "enquire" | "visit" | "message";

const titles: Record<Mode, string> = {
  enquire: "Enquire online",
  visit: "Schedule a visit",
  message: "Send us a message",
};

export function ContactForm({ mode = "enquire" }: { mode?: Mode }) {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [childName, setChildName] = useState("");
  const [classInterest, setClassInterest] = useState("Primary 1");
  const [message, setMessage] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-rise border border-[var(--line)] bg-mist/70 px-6 py-10 text-center">
        <p className="font-display text-2xl text-navy">Thank you</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-clay">
          We have received your {mode === "visit" ? "visit request" : "enquiry"}.
          Our team will respond at {SCHOOL.admissionsEmail}.
        </p>
        <button
          type="button"
          className="btn-outline mt-6"
          onClick={() => setSent(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-[var(--line)] bg-white p-6 sm:p-8"
    >
      <h3 className="font-display text-2xl text-ink">{titles[mode]}</h3>
      <p className="mt-1 text-sm text-clay">
        Academic year {SCHOOL.academicYear} · {SCHOOL.location}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <input
            required
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Phone / WhatsApp">
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={SCHOOL.whatsapp}
          />
        </Field>
        {mode !== "message" ? (
          <>
            <Field label="Child's name">
              <input
                className={inputClass}
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
            </Field>
            <Field label="Class of interest" className="sm:col-span-2">
              <select
                className={inputClass}
                value={classInterest}
                onChange={(e) => setClassInterest(e.target.value)}
              >
                <option>Nursery</option>
                <option>KG 1</option>
                <option>KG 2</option>
                <option>Primary 1</option>
                <option>Primary 2</option>
                <option>Primary 3</option>
                <option>Primary 4</option>
                <option>Primary 5</option>
                <option>Primary 6</option>
                <option>JHS 1</option>
                <option>JHS 2</option>
                <option>JHS 3</option>
              </select>
            </Field>
          </>
        ) : null}
        <Field
          label={mode === "visit" ? "Preferred visit day / notes" : "Message"}
          className="sm:col-span-2"
        >
          <textarea
            rows={4}
            className={inputClass}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              mode === "visit"
                ? "Tell us a preferred day and time…"
                : "How can we help?"
            }
          />
        </Field>
      </div>

      <button type="submit" className="btn-navy mt-6">
        {mode === "visit" ? "Request a visit" : "Submit enquiry"}
      </button>
    </form>
  );
}
