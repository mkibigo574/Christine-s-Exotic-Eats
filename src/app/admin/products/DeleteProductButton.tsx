"use client";

import { useTransition } from "react";
import { deleteProduct } from "./actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  function onClick() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    start(() => deleteProduct(id));
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
