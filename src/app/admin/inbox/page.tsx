import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "read", "replied", "archived"] as const;
type Status = (typeof STATUSES)[number];

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

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

  // List + per-status counts in parallel
  let listQuery = supabase
    .from("cee_inquiries")
    .select("id, name, email, event_date, delivery, subtotal_ex_gst, status, created_at")
    .order("created_at", { ascending: false });
  if (filter) listQuery = listQuery.eq("status", filter);

  const [
    listRes,
    totalRes,
    newRes,
    readRes,
    repliedRes,
    archivedRes,
  ] = await Promise.all([
    listQuery,
    supabase.from("cee_inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("cee_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("cee_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "read"),
    supabase
      .from("cee_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "replied"),
    supabase
      .from("cee_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "archived"),
  ]);

  const rows = listRes.data ?? [];
  const counts: Record<"all" | Status, number> = {
    all: totalRes.count ?? 0,
    new: newRes.count ?? 0,
    read: readRes.count ?? 0,
    replied: repliedRes.count ?? 0,
    archived: archivedRes.count ?? 0,
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-overline">Enquiries</div>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--color-wine-deep)] mt-2 leading-none">
            Inbox
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)] max-w-md">
            Open an enquiry to read details and reply by email.
          </p>
        </div>
      </header>

      <div className="mt-6 ornament-rule">
        <span aria-hidden>✦</span>
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <FilterChip
          href="/admin/inbox"
          label="All"
          count={counts.all}
          active={filter === null}
        />
        {STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/inbox?status=${s}`}
            label={s[0].toUpperCase() + s.slice(1)}
            count={counts[s]}
            active={filter === s}
            tone={s}
          />
        ))}
      </div>

      {/* List */}
      <div className="mt-6 card overflow-hidden divide-y divide-[var(--color-line)]">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-[var(--color-muted)]">
            No enquiries here.
          </div>
        ) : (
          rows.map((r) => {
            const accent = ACCENT[r.status as Status] ?? "transparent";
            return (
              <Link
                key={r.id}
                href={`/admin/inbox/${r.id}`}
                className="group flex flex-wrap items-center justify-between gap-4 p-5 pl-6 relative hover:bg-[var(--color-cream-soft)] transition"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all"
                  style={{ backgroundColor: accent }}
                />
                <div className="min-w-0 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="hidden sm:grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-base text-[var(--color-cream-soft)]"
                    style={{
                      background:
                        "linear-gradient(160deg, var(--color-wine), var(--color-wine-deep))",
                    }}
                  >
                    {(r.name?.[0] ?? "?").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-lg text-[var(--color-wine-dark)]">
                        {r.name}
                      </span>
                      <StatusBadge status={r.status as Status} />
                    </div>
                    <div className="text-xs text-[var(--color-muted)] mt-0.5 truncate">
                      {r.email}
                      {r.event_date ? ` · Event ${r.event_date}` : ""}
                      {r.delivery ? ` · ${r.delivery}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-[var(--color-muted)]">
                    {new Date(r.created_at).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="font-display text-base text-[var(--color-wine-dark)] mt-0.5">
                    {r.subtotal_ex_gst ? AUD.format(Number(r.subtotal_ex_gst)) : "—"}{" "}
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      ex GST
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

const ACCENT: Record<Status, string> = {
  new: "var(--color-wine)",
  read: "var(--color-cream-dark)",
  replied: "var(--color-sage)",
  archived: "transparent",
};

function FilterChip({
  href,
  label,
  count,
  active,
  tone,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  tone?: Status;
}) {
  const dot = tone ? ACCENT[tone] : undefined;
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition " +
        (active
          ? "bg-[var(--color-wine)] text-[var(--color-cream-soft)] border-[var(--color-wine)]"
          : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-soft)] hover:border-[var(--color-line-strong)]")
      }
    >
      {dot ? (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: active ? "var(--color-cream-soft)" : dot }}
        />
      ) : null}
      <span>{label}</span>
      <span
        className={
          "text-[10px] font-medium tracking-wider px-1.5 py-0.5 rounded-full " +
          (active
            ? "bg-[var(--color-cream-soft)]/20 text-[var(--color-cream-soft)]"
            : "bg-[var(--color-cream-dark)]/60 text-[var(--color-muted)]")
        }
      >
        {count}
      </span>
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
    <span
      className={`text-[10px] uppercase tracking-[0.18em] rounded-full px-2 py-0.5 ${tones[status]}`}
    >
      {status}
    </span>
  );
}
