import type { Metadata } from "next";
import { getReviews } from "@/lib/content";
import { Ornament, Mark } from "@/components/Ornament";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "What our customers say about Christine's Exotic Eats — feedback from private events, corporate functions, and repeat clients in Darwin.",
};

const CARD_TINTS = [
  "from-[rgba(196,106,63,0.18)] to-[rgba(247,230,212,0.7)]",
  "from-[rgba(138,154,120,0.20)] to-[rgba(247,241,230,0.7)]",
  "from-[rgba(216,183,116,0.22)] to-[rgba(247,241,230,0.7)]",
  "from-[rgba(227,164,141,0.22)] to-[rgba(247,241,230,0.7)]",
  "from-[rgba(106,29,41,0.12)] to-[rgba(247,230,212,0.7)]",
];

export default async function ReviewsPage() {
  const REVIEWS = await getReviews();
  if (REVIEWS.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display heading-lg text-[var(--color-wine-deep)]">Kind words</h1>
        <p className="mt-6 text-[var(--color-muted)]">Reviews coming soon.</p>
      </div>
    );
  }
  const [headline, ...rest] = REVIEWS;
  return (
    <>
      <section className="mesh-hero relative overflow-hidden grain ribbon">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center fade-up relative">
          <span className="text-overline !text-[var(--color-gold-light)]">From our customers</span>
          <h1 className="mt-3 font-display heading-lg font-semibold text-[var(--color-cream-soft)]">
            Kind words
          </h1>
          <div className="mt-5">
            <Ornament className="on-dark" />
          </div>
          <Mark className="mx-auto mt-10 text-[var(--color-honey)]" />
          <blockquote className="mt-6 font-display heading-md italic text-[var(--color-cream-soft)] leading-tight max-w-3xl mx-auto">
            &ldquo;{headline.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-overline !text-[var(--color-gold-light)]">
            {headline.author} · {headline.context}
          </figcaption>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((r, i) => (
            <figure
              key={i}
              className={`rounded-3xl p-7 md:p-8 flex flex-col relative overflow-hidden border border-[var(--color-line)] bg-gradient-to-br ${CARD_TINTS[i % CARD_TINTS.length]} shadow-[var(--shadow-soft)] lift`}
            >
              <span aria-hidden className="absolute -top-2 left-6 font-accent text-7xl text-[var(--color-gold)] opacity-60">
                &ldquo;
              </span>
              <blockquote className="mt-8 font-display text-lg md:text-xl italic text-[var(--color-ink)] leading-snug">
                {r.quote}
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-[var(--color-line)] text-sm">
                <div className="font-display text-base text-[var(--color-wine-dark)]">
                  {r.author}
                </div>
                <div className="text-overline mt-1">
                  {[r.context, r.source].filter(Boolean).join(" · ")}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  );
}
