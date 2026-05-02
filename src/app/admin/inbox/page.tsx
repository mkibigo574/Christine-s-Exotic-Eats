import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "read", "replied", "archived"] as const;
type Status = (typeof STATUSES)[number];

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = (STATUSES as readonly string[]).includes(status ?? "")
    ? (status as Status)
    : null;

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("cee_inquiries")
    .select("id, name, email, event_date, delivery, subtotal_ex_gst, status, created_at")
    .order("created_at", { ascending: false });
  if (filter) query = query.eq("status", filter);
  const { data: rows } = await query;

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-wine-deep)]">Inbox</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Inquiries sent through the website. Open one to read details and reply by email.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <FilterLink href="/admin/inbox" label="All" active={filter === null} />
        {STATUSES.map((s) => (
          <FilterLink
            key={s}
            href={`/admin/inbox?status=${s}`}
            label={s[0].toUpperCase() + s.slice(1)}
            active={filter === s}
          />
        ))}
      </div>

      <div className="mt-6 card divide-y divide-[var(--color-line)]">
        {(rows ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/admin/inbox/${r.id}`}
            className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-[var(--color-cream-soft)] transition"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-[var(--color-wine-dark)]">{r.name}</span>
                <StatusBadge status={r.status as Status} />
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">
                {r.email}
                {r.event_date ? ` · Event ${r.event_date}` : ""}
                {r.delivery ? ` · ${r.delivery}` : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-muted)]">
                {new Date(r.created_at).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="font-display text-base text-[var(--color-wine-dark)] mt-0.5">
                ${Number(r.subtotal_ex_gst).toFixed(0)} <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">ex GST</span>
              </div>
            </div>
          </Link>
        ))}
        {(!rows || rows.length === 0) ? (
          <div className="p-10 text-center text-[var(--color-muted)]">No inquiries here.</div>
        ) : null}
      </div>
    </div>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        "px-3 py-1.5 rounded-full border text-sm transition " +
        (active
          ? "bg-[var(--color-wine)] text-[var(--color-cream-soft)] border-[var(--color-wine)]"
          : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-soft)]")
      }
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const tones: Record<Status, string> = {
    new: "bg-[var(--color-wine)]/15 text-[var(--color-wine-dark)]",
    read: "bg-[var(--color-cream-dark)] text-[var(--color-ink-soft)]",
    replied: "bg-[rgba(138,154,120,0.25)] text-[var(--color-sage-deep)]",
    archived: "bg-[var(--color-line)] text-[var(--color-muted)]",
  };
  return (
    <span className={`text-[10px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 ${tones[status]}`}>
      {status}
    </span>
  );
}
