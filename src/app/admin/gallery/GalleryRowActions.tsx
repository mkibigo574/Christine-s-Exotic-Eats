"use client";

import { useTransition } from "react";
import { deleteGalleryImage } from "./actions";

export function GalleryRowActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  function onDelete() {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    start(() => deleteGalleryImage(id));
  }
  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-line)]">
      <button type="submit" className="btn-ghost text-xs !py-2 !px-4">Save</button>
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="text-xs text-red-700 hover:underline disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
