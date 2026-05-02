import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteReviewButton } from "./DeleteReviewButton";

export const dynamic = "force-dynamic";

export default async function ReviewsAdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: reviews } = await supabase
    .from("cee_reviews")
    .select("id, quote, author, context, source, is_published, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[var(--color-wine-deep)]">Reviews</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Curated quotes from your Facebook page or other sources.
          </p>
        </div>
        <Link href="/admin/reviews/new" className="btn-primary">+ New review</Link>
      </div>

      <div className="mt-8 grid gap-4">
        {(reviews ?? []).map((r) => (
          <div key={r.id} className="card p-5 grid gap-2">
            <div className="flex items-start justify-between gap-4">
              <p className="font-display italic text-lg text-[var(--color-ink)] leading-snug">
                &ldquo;{r.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <Link href={`/admin/reviews/${r.id}`} className="btn-ghost text-xs !py-2 !px-4">Edit</Link>
                <DeleteReviewButton id={r.id} />
              </div>
            </div>
            <div className="text-xs text-[var(--color-muted)]">
              {r.author}
              {r.context ? ` · ${r.context}` : ""}
              {r.source ? ` · ${r.source}` : ""}
              {!r.is_published ? " · Hidden" : ""}
            </div>
          </div>
        ))}
        {(!reviews || reviews.length === 0) ? (
          <div className="card p-10 text-center text-[var(--color-muted)]">No reviews yet.</div>
        ) : null}
      </div>
    </div>
  );
}
