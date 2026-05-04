import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  findCategory,
  getCategories,
  formatPrice,
  FEEDING_ESTIMATES,
} from "@/lib/content";
import { meshFor } from "@/lib/theme";
import { Ornament } from "@/components/Ornament";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await findCategory(slug);
  if (!cat) return { title: "Catalogue" };
  return {
    title: `${cat.name} — Catalogue`,
    description: cat.blurb,
  };
}

function feedingFor(label: string): string | null {
  if (FEEDING_ESTIMATES[label]) return FEEDING_ESTIMATES[label];
  for (const key of Object.keys(FEEDING_ESTIMATES)) {
    if (label.toLowerCase().startsWith(key.toLowerCase())) {
      return FEEDING_ESTIMATES[key];
    }
  }
  return null;
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cat = await findCategory(slug);
  if (!cat) notFound();

  const others = (await getCategories()).filter((c) => c.slug !== slug).slice(0, 4);

  return (
    <>
      <section className="band-warm relative grain-light">
        <div className="mx-auto max-w-5xl px-6 py-16 fade-up">
          <Link
            href="/catalogue"
            className="text-sm font-medium text-[var(--color-wine)] hover:text-[var(--color-wine-dark)] transition"
          >
            ← Back to catalogue
          </Link>
          <div className="mt-6 grid gap-10 md:grid-cols-[260px_1fr] items-center">
            <div
              className={`aspect-square w-[260px] max-w-full rounded-2xl border border-[var(--color-line-strong)] grain relative overflow-hidden shadow-[var(--shadow-soft)] ${cat.image_url ? "" : meshFor(cat.slug)}`}
            >
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.image_alt ?? cat.name}
                  fill
                  sizes="260px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-overline !text-[var(--color-wine-deep)]">
                  {cat.name}
                </div>
              )}
            </div>
            <div>
              <span className="text-overline">The boxed range</span>
              <h1 className="mt-2 font-display heading-lg font-semibold text-[var(--color-wine-deep)]">
                {cat.name}
              </h1>
              <div className="mt-4">
                <Ornament />
              </div>
              <p className="mt-5 text-[var(--color-ink-soft)] text-lg leading-relaxed">
                {cat.blurb}
              </p>
              {cat.notes ? (
                <p className="mt-3 text-sm italic text-[var(--color-muted)] max-w-prose">
                  {cat.notes}
                </p>
              ) : null}
              <div className="mt-6">
                <Link
                  href={`/inquire?box=${cat.slug}`}
                  className="btn-primary"
                >
                  Inquire about {cat.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10">
          <Ornament label={cat.sizes.length > 1 ? "Choose a size" : "Details"} />
        </div>

        {cat.sizes.length === 0 ? (
          <p className="text-center text-[var(--color-muted)] italic">
            Pricing on request — please use the inquiry form.
          </p>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cat.sizes.map((size) => {
              const serves = feedingFor(size.label);
              return (
                <article
                  key={size.id ?? size.label}
                  className="card overflow-hidden flex flex-col"
                >
                  <div
                    className={`aspect-[4/3] relative grain overflow-hidden ${size.image_url ? "" : meshFor(cat.slug)}`}
                  >
                    {size.image_url ? (
                      <Image
                        src={size.image_url}
                        alt={size.image_alt ?? `${size.label} ${cat.name}`}
                        fill
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-overline !text-[var(--color-wine-deep)]">
                        {size.label}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl font-semibold text-[var(--color-wine-dark)]">
                        {size.label}
                      </h3>
                      <div className="text-right shrink-0">
                        <span className="font-display text-xl text-[var(--color-wine-deep)]">
                          {formatPrice(size.price)}
                        </span>
                        {size.unit ? (
                          <span className="ml-1 text-xs text-[var(--color-muted)]">
                            {size.unit}
                          </span>
                        ) : null}
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                          ex GST
                        </div>
                      </div>
                    </div>
                    {serves ? (
                      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                        {serves}
                      </p>
                    ) : null}
                    {size.notes ? (
                      <p className="mt-2 text-sm text-[var(--color-muted)] italic">
                        {size.notes}
                      </p>
                    ) : null}
                    <div className="mt-auto pt-5">
                      <Link
                        href={`/inquire?box=${cat.slug}&size=${encodeURIComponent(size.label)}`}
                        className="btn-ghost w-full text-center"
                      >
                        Inquire about {size.label}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {others.length ? (
          <section className="mt-24">
            <div className="mb-8">
              <Ornament label="Also from the range" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/catalogue/${o.slug}`}
                  className="card group overflow-hidden flex flex-col"
                >
                  <div
                    className={`aspect-[4/3] relative grain overflow-hidden ${o.image_url ? "" : meshFor(o.slug)}`}
                  >
                    {o.image_url ? (
                      <Image
                        src={o.image_url}
                        alt={o.image_alt ?? o.name}
                        fill
                        sizes="(min-width: 1024px) 280px, 45vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h4 className="font-display text-base font-semibold text-[var(--color-wine-dark)] group-hover:text-[var(--color-wine)] transition">
                      {o.name}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
