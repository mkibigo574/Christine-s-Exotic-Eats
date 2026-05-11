import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RecentInquiry = {
  id: string;
  name: string;
  subtotal_ex_gst: number | null;
  status: string;
  created_at: string;
};

const AUD = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

export default async function AdminOverview() {
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    productsRes,
    reviewsRes,
    galleryRes,
    inboxRes,
    newRes,
    weekRes,
    monthRevenueRes,
    recentRes,
  ] = await Promise.all([
    supabase.from("cee_products").select("*", { count: "exact", head: true }),
    supabase.from("cee_reviews").select("*", { count: "exact", head: true }),
    supabase.from("cee_gallery_images").select("*", { count: "exact", head: true }),
    supabase.from("cee_inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("cee_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("cee_inquiries")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase
      .from("cee_inquiries")
      .select("subtotal_ex_gst")
      .gte("created_at", monthStart),
    supabase
      .from("cee_inquiries")
      .select("id, name, subtotal_ex_gst, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const monthRevenue = (monthRevenueRes.data ?? []).reduce(
    (sum, r) => sum + (Number(r.subtotal_ex_gst) || 0),
    0,
  );

  const recent: RecentInquiry[] = (recentRes.data ?? []) as RecentInquiry[];

  return (
    <div>
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-overline">Dashboard</div>
          <h1 className="font-display text-4xl md:text-5xl text-[var(--color-wine-deep)] mt-2 leading-none">
            Overview
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)] max-w-md">
            Everything you need to keep the site fresh and the inbox tidy.
          </p>
        </div>
        <Link href="/admin/inbox?status=new" className="btn-primary">
          Open new inquiries
        </Link>
      </header>

      <div className="mt-6 ornament-rule">
        <span aria-hidden>✦</span>
      </div>

      {/* Hero stats */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatHero
          label="New inquiries"
          value={String(newRes.count ?? 0)}
          hint={
            (newRes.count ?? 0) > 0
              ? "Awaiting your reply"
              : "All caught up"
          }
          href="/admin/inbox?status=new"
          tone="wine"
        />
        <StatHero
          label="This week"
          value={String(weekRes.count ?? 0)}
          hint="Inquiries in the last 7 days"
          href="/admin/inbox"
          tone="cream"
        />
        <StatHero
          label="Revenue (this month, ex GST)"
          value={AUD.format(monthRevenue)}
          hint="Quoted total across inquiries"
          href="/admin/inbox"
          tone="gold"
        />
      </section>

      {/* Secondary stats */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatMini label="Products" count={productsRes.count ?? 0} href="/admin/products" />
        <StatMini label="Reviews" count={reviewsRes.count ?? 0} href="/admin/reviews" />
        <StatMini label="Gallery photos" count={galleryRes.count ?? 0} href="/admin/gallery" />
        <StatMini label="All inquiries" count={inboxRes.count ?? 0} href="/admin/inbox" />
      </section>

      {/* Recent activity */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-overline">Recent activity</div>
            <h2 className="font-display text-2xl text-[var(--color-wine-dark)] mt-1">
              Latest inquiries
            </h2>
          </div>
          <Link
            href="/admin/inbox"
            className="text-sm text-[var(--color-wine)] hover:text-[var(--color-wine-dark)] transition"
          >
            View all →
          </Link>
        </div>

        <div className="mt-4 card divide-y divide-[var(--color-line)]">
          {recent.length === 0 ? (
            <div className="p-10 text-center text-[var(--color-muted)]">
              No inquiries yet.
            </div>
          ) : (
            recent.map((r) => (
              <Link
                key={r.id}
                href={`/admin/inbox/${r.id}`}
                className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-[var(--color-cream-soft)] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden
                    className="h-9 w-9 rounded-full grid place-items-center font-display text-sm text-[var(--color-cream-soft)] shrink-0"
                    style={{
                      background:
                        "linear-gradient(160deg, var(--color-wine), var(--color-wine-deep))",
                    }}
                  >
                    {(r.name?.[0] ?? "?").toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base text-[var(--color-wine-dark)] truncate">
                        {r.name}
                      </span>
                      <StatusDot status={r.status} />
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {formatRelative(r.created_at)} ·{" "}
                      <span className="capitalize">{r.status}</span>
                    </div>
                  </div>
                </div>
                <div className="font-display text-base text-[var(--color-wine-dark)]">
                  {r.subtotal_ex_gst ? AUD.format(Number(r.subtotal_ex_gst)) : "—"}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatHero({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  tone: "wine" | "cream" | "gold";
}) {
  const styles = {
    wine: {
      bg: "linear-gradient(160deg, var(--color-wine-deep), var(--color-wine-dark) 60%, var(--color-plum))",
      label: "color: rgba(255,255,255,0.7)",
      value: "color: var(--color-cream-soft)",
      hint: "color: rgba(255,255,255,0.6)",
      border: "1px solid rgba(216, 183, 116, 0.30)",
      shadow: "var(--shadow-wine)",
    },
    cream: {
      bg: "var(--color-cream-soft)",
      label: "",
      value: "color: var(--color-wine-deep)",
      hint: "color: var(--color-muted)",
      border: "1px solid var(--color-cream-dark)",
      shadow: "var(--shadow-soft)",
    },
    gold: {
      bg: "linear-gradient(160deg, #f6e2bf, #ecd095 60%, #d9b066)",
      label: "",
      value: "color: var(--color-wine-deep)",
      hint: "color: var(--color-wine-dark); opacity: 0.7",
      border: "1px solid rgba(184, 138, 62, 0.45)",
      shadow: "var(--shadow-soft)",
    },
  }[tone];

  return (
    <Link
      href={href}
      className="lift block rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: styles.bg,
        border: styles.border,
        boxShadow: styles.shadow,
      }}
    >
      <div className="text-overline" style={tone === "wine" ? { color: "var(--color-gold-light)" } : undefined}>
        {label}
      </div>
      <div
        className="font-display mt-3 leading-none"
        style={{
          fontSize: "clamp(2.5rem, 4vw + 0.5rem, 3.75rem)",
          ...(tone === "wine"
            ? { color: "var(--color-cream-soft)" }
            : { color: "var(--color-wine-deep)" }),
        }}
      >
        {value}
      </div>
      <div
        className="mt-3 text-xs"
        style={
          tone === "wine"
            ? { color: "rgba(255,255,255,0.65)" }
            : { color: "var(--color-muted)" }
        }
      >
        {hint}
      </div>
    </Link>
  );
}

function StatMini({
  label,
  count,
  href,
}: {
  label: string;
  count: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card lift block p-5"
    >
      <div className="text-overline">{label}</div>
      <div className="mt-2 font-display text-2xl text-[var(--color-wine-deep)]">{count}</div>
    </Link>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: "var(--color-wine)",
    read: "var(--color-muted-light)",
    replied: "var(--color-sage)",
    archived: "var(--color-line-strong)",
  };
  return (
    <span
      aria-label={status}
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: colors[status] ?? "var(--color-muted-light)" }}
    />
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}
