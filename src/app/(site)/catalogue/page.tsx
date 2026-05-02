import Link from "next/link";
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
            All prices below are exclusive of GST. Custom orders are available
            on request — describe what you have in mind on the inquiry form.
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

      <div className="mx-auto max-w-5xl px-6 py-24">
        <section className="grid gap-16">
          {CATEGORIES.map((cat, i) => (
            <article key={cat.slug} id={cat.slug} className="scroll-mt-24">
              <div className={`grid gap-8 md:grid-cols-[300px_1fr] items-start ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div
                  className={`aspect-[4/5] rounded-3xl border border-[var(--color-line-strong)] grain relative overflow-hidden shadow-[var(--shadow-soft)] ${meshFor(cat.slug)}`}
                >
                  <div className="absolute inset-0 grid place-items-center text-overline !text-[var(--color-wine-deep)]">
                    {cat.name}
                  </div>
                  <div className="absolute top-3 left-3 font-accent italic text-3xl text-[var(--color-wine-deep)]/80">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>

                <div>
                  <h2 className="font-display heading-md font-semibold text-[var(--color-wine-deep)]">
                    {cat.name}
                  </h2>
                  <p className="mt-2 text-[var(--color-ink-soft)] text-lg italic font-display">
                    {cat.blurb}
                  </p>

                  <ul className="mt-7 space-y-1">
                    {cat.sizes.map((size) => (
                      <li key={size.label}>
                        <div className="flex items-end gap-3 py-2.5">
                          <div className="shrink-0">
                            <span className="font-display text-lg text-[var(--color-ink)]">
                              {size.label}
                            </span>
                            {size.unit ? (
                              <span className="text-[var(--color-muted)] text-sm font-normal">
                                {" "}({size.unit})
                              </span>
                            ) : null}
                          </div>
                          <div className="flex-1 leader h-3 mx-1 mb-1 opacity-70" />
                          <div className="shrink-0 text-right">
                            <span className="font-display text-xl text-[var(--color-wine-dark)]">
                              {formatPrice(size.price)}
                            </span>
                            <span className="ml-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                              ex GST
                            </span>
                          </div>
                        </div>
                        {size.notes ? (
                          <p className="text-sm text-[var(--color-muted)] -mt-1 mb-2 max-w-md italic">
                            {size.notes}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  {cat.notes ? (
                    <p className="mt-3 text-sm italic text-[var(--color-muted)]">
                      {cat.notes}
                    </p>
                  ) : null}

                  <div className="mt-7">
                    <Link
                      href={`/inquire?box=${cat.slug}`}
                      className="btn-ghost"
                    >
                      Inquire about {cat.name}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
