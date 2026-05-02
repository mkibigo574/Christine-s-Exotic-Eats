"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export function ReplyForm({
  action,
  defaultSubject,
  defaultBody,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultSubject: string;
  defaultBody: string;
}) {
  const [error, setError] = useState<string | null>(null);

  async function handle(formData: FormData) {
    setError(null);
    try {
      await action(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send reply.");
    }
  }

  return (
    <form action={handle} className="grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-overline">Subject</span>
        <input name="subject" defaultValue={defaultSubject} required className="input" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-overline">Message</span>
        <textarea
          name="body"
          rows={10}
          defaultValue={defaultBody}
          required
          className="input resize-y"
        />
      </label>
      {error ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
      {pending ? "Sending…" : "Send reply"}
    </button>
  );
}
