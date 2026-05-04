import Link from "next/link";
import Image from "next/image";
import { getCategories, getReviews, formatPrice, type Category, type Review } from "@/lib/content";
import { meshFor } from "@/lib/theme";
import { Ornament, Mark } from "@/components/Ornament";
import { Monogram } from "@/components/Logo";

export const dynamic = "force-dynamic";

const featuredSlugs = ["grazing-boxes", "sweet-boxes", "fruit-boxes", "hot-savoury-boxes"];

export default async function HomePage() {
  const [categories, reviews] = await Promise.all([getCategories(), getReviews()]);
  const featured = categories.filter((c) => featuredSlugs.includes(c.slug));
  return (
    <>
      <Hero />
      <Pillars />
      <Featured featured={featured} />
      <ReviewStrip review={reviews[0]} />
      <CallToInquire />
    </>
  );
}

function Hero() {
  return (
    <section className="mesh-hero relative overflow-hidden grain ribbon">
      <div className="mx-auto max-w-6xl px-6 pt-24 md:pt-28 pb-28 grid gap-14 md:grid-cols-[1.1fr_1fr] items-center relative">
        <div className="fade-up relative">
          <div className="flex items-center gap-3 text-[var(--color-gold-light)]">
            <Mark />
            <span className="text-overline !text-[var(--color-gold-light)]">
              Darwin · Est. 2019
            </span>
          </div>
          <h1 className="mt-6 font-display heading-xl font-semibold text-[var(--color-cream-soft)]">
            Catering that{" "}
            <span className="font-accent italic font-normal text-[var(--color-honey)]">
              enlightens
            </span>{" "}
            your tastebuds.
          </h1>
          <p className="mt-7 max-w-xl text-lg text-[color:rgba(247,241,230,0.85)] leading-relaxed">
            A family-run Darwin catering house, lovingly crafting grazing,
            sandwich, fruit, and sweet boxes — for private gatherings and
            corporate occasions alike.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/inquire" className="btn-gold">
              Send an inquiry
              <span aria-hidden>→</span>
            </Link>
            <Link href="/catalogue" className="btn-ghost-light">
              View the catalogue
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4">
            <Stat label="Years catering Darwin" value="6+" />
            <Stat label="Box varieties" value="10" />
            <Stat label="Largest box serves" value="20" />
          </div>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-[var(--color-honey)] leading-none">
        {value}
      </div>
      <div className="text-overline mt-1.5 !text-[var(--color-gold-light)]">{label}</div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-[560px] md:h-[620px]">
      <div className="absolute inset-x-6 top-0 bottom-12 rounded-[2rem] mesh-grazing border border-[rgba(216,183,116,0.40)] grain overflow-hidden shadow-[var(--shadow-deep)]">
        <div className="absolute inset-0 grid place-items-center text-center px-10">
          <div>
            <div className="text-overline !text-[var(--color-wine-deep)]">Hero photograph</div>
            <p className="mt-3 font-display italic text-2xl text-[var(--color-wine-deep)]">
              Replace with a signature box or styled spread.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-12 w-44 h-44 md:w-56 md:h-56 rounded-2xl mesh-sweet border border-[rgba(216,183,116,0.45)] grain overflow-hidden rotate-[4deg] shadow-[var(--shadow-deep)]">
        <div className="absolute inset-0 grid place-items-center text-overline !text-[var(--color-wine-deep)]">
          Photo 02
        </div>
      </div>

      <div className="absolute -left-2 bottom-0 w-52 md:w-64 rounded-2xl bg-[var(--color-paper)] border border-[var(--color-line)] shadow-[var(--shadow-deep)] px-5 py-5 -rotate-[2deg]">
        <div className="flex items-center gap-2 text-[var(--color-gold)]">
          <Mark />
        </div>
        <div className="mt-2 font-accent italic text-2xl text-[var(--color-wine-dark)] leading-tight">
          &ldquo;Enlighten your tastebuds.&rdquo;
        </div>
        <div className="mt-2 text-overline">Our promise</div>
      </div>

      <div className="absolute right-6 -bottom-2 hidden md:flex items-center gap-3 rounded-full bg-[var(--color-paper)] border border-[var(--color-line)] px-4 py-2 shadow-[var(--shadow-soft)]">
        <Monogram size={28} />
        <span className="font-display italic text-sm text-[var(--color-wine-dark)]">
          Made fresh, by hand.
        </span>
      </div>
    </div>
  );
}

function Pillars() {
  const items = [
    {
      title: "Locally sourced",
      body: "Fresh produce from Darwin growers — supporting our community plate by plate.",
      tint: "from-[rgba(138,154,120,0.22)] to-[rgba(247,241,230,0.65)]",
      mark: "var(--color-sage-deep)",
    },
    {
      title: "Beautifully presented",
      body: "Each box is styled with the same care we'd bring to our own table.",
      tint: "from-[rgba(196,106,63,0.20)] to-[rgba(247,230,212,0.7)]",
      mark: "var(--color-terracotta-deep)",
    },
    {
      title: "Custom orders welcome",
      body: "Beyond the menu? Tell us about your event and we'll craft something bespoke.",
      tint: "from-[rgba(216,183,116,0.30)] to-[rgba(247,241,230,0.7)]",
      mark: "var(--color-gold-deep)",
    },
  ];
  return (
    <section className="band-warm relative grain-light">
      <div className="mx-auto max-w-6xl px-6 py-24 relative">
        <div className="mb-12 max-w-xl">
          <span className="text-overline">Our craft</span>
          <h2 className="mt-2 font-display heading-md font-semibold text-[var(--color-wine-deep)]">
            Crafted with intention.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={i}
              className={`rounded-3xl p-8 relative grain overflow-hidden border border-[var(--color-line)] bg-gradient-to-br ${item.tint} lift shadow-[var(--shadow-soft)]`}
            >
              <div
                className="font-display text-5xl leading-none"
                style={{ color: item.mark }}
              >
                0{i + 1}
              </div>
              <h3 className="mt-5 font-display text-2xl text-[var(--color-wine-deep)]">
                {item.title}
              </h3>
              <p className="mt-3 text-[var(--color-ink-soft)] leading-relaxed">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Featured({ featured }: { featured: Category[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-overline">Selected favourites</span>
          <h2 className="mt-2 font-display heading-md font-semibold text-[var(--color-wine-deep)]">
            Featured boxes
          </h2>
        </div>
        <Link
          href="/catalogue"
          className="text-sm font-medium text-[var(--color-wine)] hover:text-[var(--color-wine-dark)] transition"
        >
          See full catalogue →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((cat) => {
          const from = Math.min(...cat.sizes.map((s) => s.price));
          return (
            <Link
              key={cat.slug}
              href={`/catalogue/${cat.slug}`}
              className="card group overflow-hidden flex flex-col"
            >
              <div className={`aspect-[4/3] relative grain overflow-hidden ${cat.image_url ? "" : meshFor(cat.slug)}`}>
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.image_alt ?? cat.name}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
                    quality={90}
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-overline !text-[var(--color-wine-deep)]">
                    Photo
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-display text-xl font-semibold text-[var(--color-wine-dark)] group-hover:text-[var(--color-wine)] transition">
                  {cat.name}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--color-muted)] line-clamp-2">
                  {cat.blurb}
                </p>
                <div className="mt-auto pt-4 flex items-baseline gap-2">
                  <span className="text-overline">From</span>
                  <span className="font-display text-xl text-[var(--color-wine-dark)]">
                    {formatPrice(from)}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">excl. GST</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ReviewStrip({ review: r }: { review: Review | undefined }) {
  if (!r) return null;
  return (
    <section className="band-sage relative grain-light">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center relative">
        <Mark className="mx-auto text-[var(--color-sage-deep)]" />
        <blockquote className="mt-6 font-display heading-md italic text-[var(--color-wine-deep)] leading-tight">
          &ldquo;{r.quote}&rdquo;
        </blockquote>
        <div className="mt-6 text-overline !text-[var(--color-sage-deep)]">
          {r.author} · {r.context}
        </div>
        <div className="mt-8">
          <Link
            href="/reviews"
            className="text-sm font-medium text-[var(--color-wine-dark)] hover:text-[var(--color-wine)] transition"
          >
            More reviews →
          </Link>
        </div>
      </div>
    </section>
  );
}

function CallToInquire() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2rem] mesh-deep-wine grain px-8 md:px-16 py-16 md:py-20 grid md:grid-cols-[1.5fr_1fr] gap-10 items-center">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(216,183,116,0.45),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,106,63,0.30),transparent_70%)] pointer-events-none" />
        <div className="relative">
          <span className="text-overline !text-[var(--color-gold-light)]">Bookings &amp; quotes</span>
          <h2 className="mt-3 font-display heading-md font-semibold text-[var(--color-cream-soft)]">
            Ready to plan your next event?
          </h2>
          <p className="mt-4 text-[color:rgba(247,241,230,0.85)] max-w-xl leading-relaxed">
            Send an inquiry with your event details. We confirm availability
            before discussing payment — and custom orders are always welcome.
          </p>
        </div>
        <div className="relative md:justify-self-end">
          <Link href="/inquire" className="btn-gold">
            Start an inquiry
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
