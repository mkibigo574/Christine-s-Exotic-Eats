"use client";

import { useTransition } from "react";
import { deleteReview } from "./actions";

export function DeleteReviewButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm("Delete this review?")) return;
    start(() => deleteReview(id));
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs text-red-700 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
