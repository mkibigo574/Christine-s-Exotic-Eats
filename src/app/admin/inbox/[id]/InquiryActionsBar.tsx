"use client";

import { useTransition } from "react";
import { setStatus, deleteInquiry } from "../actions";

export function InquiryActionsBar({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  function archive() {
    start(() => setStatus(id, "archived"));
  }
  function unarchive() {
    start(() => setStatus(id, "read"));
  }
  function remove() {
    if (!confirm("Permanently delete this enquiry?")) return;
    start(() => deleteInquiry(id));
  }
  return (
    <div className="flex items-center gap-3 shrink-0">
      {status === "archived" ? (
        <button onClick={unarchive} disabled={pending} className="btn-ghost text-xs !py-2 !px-4">
          Unarchive
        </button>
      ) : (
        <button onClick={archive} disabled={pending} className="btn-ghost text-xs !py-2 !px-4">
          Archive
        </button>
      )}
      <button
        onClick={remove}
        disabled={pending}
        className="text-xs text-red-700 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
