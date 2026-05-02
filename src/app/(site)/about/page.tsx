import Link from "next/link";
import type { Metadata } from "next";
import { Ornament, Mark } from "@/components/Ornament";

export const metadata: Metadata = {
  title: "About",
  description:
    "Christine's Exotic Eats is a Darwin based, family owned & operated, small catering business, established in 2019.",
};

export default function AboutPage() {
  return (
    <>
      <section className="band-warm relative grain-light">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center fade-up relative">
          <span className="text-overline">Our story</span>
          <h1 className="mt-3 font-display heading-lg font-semibold text-[var(--color-wine-deep)]">
            Family-run, Darwin-grown.
          </h1>
          <div className="mt-5">
            <Ornament />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-lg leading-[1.85] text-[var(--color-ink)] font-display">
          <p className="drop-cap">
            Christine&rsquo;s Exotic Eats is a Darwin based, family owned &amp;
            operated, small catering business, servicing both private and
            corporate clients. Established in 2019, our small business has
            seen significant growth over the years and endeavours to continue
            thriving and serving the amazing Darwin community.
          </p>
          <p className="mt-6">
            Our sole purpose is to enlighten our customers&rsquo; tastebuds.
            Whether it&rsquo;s an intimate event for a few or a large one, we
            know no bounds. We pride ourselves in using fresh, locally sourced
            ingredients,{" "}
            <span className="italic text-[var(--color-wine)]">cooked with love</span>.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <ValueCard
            tint="from-[rgba(138,154,120,0.30)] to-[rgba(247,241,230,0.65)]"
            mark="var(--color-sage-deep)"
            label="Local"
            text="Darwin-sourced produce wherever possible."
          />
          <ValueCard
            tint="from-[rgba(196,106,63,0.22)] to-[rgba(247,230,212,0.7)]"
            mark="var(--color-terracotta-deep)"
            label="Fresh"
            text="Made by hand on the day of your event."
          />
          <ValueCard
            tint="from-[rgba(216,183,116,0.30)] to-[rgba(247,241,230,0.7)]"
            mark="var(--color-gold-deep)"
            label="With love"
            text="Cooked with the same care we'd bring to family."
          />
        </div>
      </div>

      <section className="mesh-deep-wine relative grain overflow-hidden">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center relative">
          <Mark className="mx-auto text-[var(--color-honey)]" />
          <div className="mt-4 text-overline !text-[var(--color-gold-light)]">Our promise</div>
          <p className="mt-3 font-accent italic text-3xl md:text-5xl text-[var(--color-cream-soft)]">
            Enlighten your tastebuds.
          </p>
          <Link href="/inquire" className="mt-10 btn-gold">
            Send an inquiry
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}

function ValueCard({
  tint,
  mark,
  label,
  text,
}: {
  tint: string;
  mark: string;
  label: string;
  text: string;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border border-[var(--color-line)] bg-gradient-to-br ${tint} shadow-[var(--shadow-soft)]`}
    >
      <div className="text-overline" style={{ color: mark }}>
        {label}
      </div>
      <p className="mt-2 font-display text-lg text-[var(--color-wine-deep)]">
        {text}
      </p>
    </div>
  );
}
