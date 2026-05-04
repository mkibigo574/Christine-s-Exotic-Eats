import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCategories, DELIVERY, FEEDING_ESTIMATES, formatPrice } from "@/lib/content";
import { meshFor } from "@/lib/theme";
import { Ornament } from "@/components/Ornament";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Browse our boxed range — fruit, grazing, sandwich, sweet and more. Prices exclude GST.",
};

export default async function CataloguePage() {
  const CATEGORIES = await getCategories();
  return (
    <>
      <section className="band-warm relative grain-light">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center fade-up relative">
          <span className="text-overline">Vol. I · The boxed range</span>
          <h1 className="mt-3 font-display heading-lg font-semibold text-[var(--color-wine-deep)]">
            Catalogue
          </h1>
          <div className="mt-5">
            <Ornament />
          </div>
          <p className="mt-6 mx-auto max-w-2xl text-[var(--color-ink-soft)] text-lg leading-relaxed">
            All prices below are exclusive of GST. Tap any box to see all sizes
            available, or describe a custom order on the inquiry form.
          </p>
          <div className="mt-12 grid gap-3 md:grid-cols-3 max-w-3xl mx-auto">
            {Object.entries(FEEDING_ESTIMATES).map(([size, serves]) => (
              <div
                key={size}
                className="rounded-2xl bg-[var(--color-paper)]/85 border border-[var(--color-line)] backdrop-blur px-5 py-5 text-left"
              >
                <div className="text-overline">{size} box</div>
                <div className="mt-1 font-display text-xl text-[var(--color-wine-dark)]">
                  {serves}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const from = cat.sizes.length
              ? Math.min(...cat.sizes.map((s) => s.price))
              : null;
            const sizeCount = cat.sizes.length;
            return (
              <Link
                key={cat.slug}
                href={`/catalogue/${cat.slug}`}
                className="card group overflow-hidden flex flex-col hover:-translate-y-0.5 transition"
              >
                <div
                  className={`aspect-[4/3] relative grain overflow-hidden ${cat.image_url ? "" : meshFor(cat.slug)}`}
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.image_alt ?? cat.name}
                      fill
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                      className="object-cover"
                      priority={i < 3}
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-overline !text-[var(--color-wine-deep)]">
                      {cat.name}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 font-accent italic text-2xl text-[var(--color-wine-deep)]/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="font-display text-xl font-semibold text-[var(--color-wine-dark)] group-hover:text-[var(--color-wine)] transition">
                    {cat.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-[var(--color-muted)] line-clamp-2">
                    {cat.blurb}
                  </p>
                  <div className="mt-auto pt-5 flex items-baseline justify-between gap-3">
                    {from !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-overline">From</span>
                        <span className="font-display text-xl text-[var(--color-wine-dark)]">
                          {formatPrice(from)}
                        </span>
                        <span className="text-xs text-[var(--color-muted)]">excl. GST</span>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--color-muted)] italic">
                        Price on request
                      </span>
                    )}
                    {sizeCount > 1 ? (
                      <span className="text-xs text-[var(--color-muted)]">
                        {sizeCount} sizes →
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)]">View →</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="mt-24">
          <div className="mb-10">
            <Ornament label="Delivery & pick-up" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {DELIVERY.map((d, i) => {
              const accents = [
                "from-[rgba(196,106,63,0.20)] to-[rgba(247,230,212,0.65)]",
                "from-[rgba(106,29,41,0.18)] to-[rgba(247,230,212,0.65)]",
                "from-[rgba(138,154,120,0.22)] to-[rgba(247,241,230,0.7)]",
              ];
              return (
                <div
                  key={d.zone}
                  className={`rounded-2xl border border-[var(--color-line)] px-5 py-5 bg-gradient-to-br ${accents[i] ?? accents[0]} shadow-[var(--shadow-soft)]`}
                >
                  <div className="text-overline">
                    {d.fee === 0 ? "Pick-up" : "Delivery"}
                  </div>
                  <div className="mt-1 font-display text-xl text-[var(--color-wine-deep)]">
                    {d.zone}
                  </div>
                  <div className="mt-1 text-sm text-[var(--color-ink-soft)]">
                    {d.fee === 0 ? "Complimentary" : `$${d.fee}`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
