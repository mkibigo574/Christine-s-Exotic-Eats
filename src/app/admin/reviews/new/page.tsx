import Link from "next/link";
import { ReviewForm } from "../ReviewForm";
import { createReview } from "../actions";

export default function NewReviewPage() {
  return (
    <div>
      <Link href="/admin/reviews" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Back to reviews
      </Link>
      <h1 className="mt-3 font-display text-3xl text-[var(--color-wine-deep)]">New review</h1>
      <div className="mt-8">
        <ReviewForm action={createReview} submitLabel="Add review" />
      </div>
    </div>
  );
}
