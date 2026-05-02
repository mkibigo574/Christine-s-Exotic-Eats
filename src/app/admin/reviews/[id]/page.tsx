import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReviewForm } from "../ReviewForm";
import { updateReview } from "../actions";
import type { Review } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cee_reviews")
    .select("id, quote, author, context, source, is_published, sort_order")
    .eq("id", id)
    .single();
  if (!data) notFound();
  const action = updateReview.bind(null, id);
  return (
    <div>
      <Link href="/admin/reviews" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Back to reviews
      </Link>
      <h1 className="mt-3 font-display text-3xl text-[var(--color-wine-deep)]">Edit review</h1>
      <div className="mt-8">
        <ReviewForm action={action} initial={data as Review} submitLabel="Save changes" />
      </div>
    </div>
  );
}
