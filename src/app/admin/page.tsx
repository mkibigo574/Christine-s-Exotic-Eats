import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = await createSupabaseServerClient();
  const [products, reviews, gallery, inbox, newCount] = await Promise.all([
    supabase.from("cee_products").select("*", { count: "exact", head: true }),
    supabase.from("cee_reviews").select("*", { count: "exact", head: true }),
    supabase.from("cee_gallery_images").select("*", { count: "exact", head: true }),
    supabase.from("cee_inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("cee_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const cards = [
    { label: "Products", count: products.count ?? 0, href: "/admin/products" },
    { label: "Reviews", count: reviews.count ?? 0, href: "/admin/reviews" },
    { label: "Gallery images", count: gallery.count ?? 0, href: "/admin/gallery" },
    { label: "All inquiries", count: inbox.count ?? 0, href: "/admin/inbox" },
    { label: "New inquiries", count: newCount.count ?? 0, href: "/admin/inbox?status=new" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-wine-deep)]">Overview</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Manage everything that appears on the site, and handle incoming inquiries.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card p-6 lift block"
          >
            <div className="text-overline">{c.label}</div>
            <div className="mt-2 font-display text-4xl text-[var(--color-wine-deep)]">
              {c.count}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
