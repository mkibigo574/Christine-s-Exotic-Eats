import type { Metadata } from "next";
import { Suspense } from "react";
import { InquiryForm } from "./InquiryForm";
import { Ornament } from "@/components/Ornament";
import { getCategories, DELIVERY } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Send an inquiry",
  description:
    "Tell us about your event and we'll confirm availability before progressing to the next steps.",
};

export default async function InquirePage() {
  const categories = await getCategories();
  return (
    <>
      <section className="band-warm relative grain-light">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center fade-up relative">
          <span className="text-overline">Bookings &amp; quotes</span>
          <h1 className="mt-3 font-display heading-lg font-semibold text-[var(--color-wine-deep)]">
            Send an inquiry
          </h1>
          <div className="mt-5">
            <Ornament />
          </div>
          <p className="mt-6 text-[var(--color-ink-soft)] text-lg leading-relaxed">
            Share the details of your event and what you&rsquo;d like to
            order. We&rsquo;ll confirm availability by reply before discussing
            payment.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <Suspense fallback={<div className="text-[var(--color-muted)]">Loading form…</div>}>
          <InquiryForm categories={categories} delivery={DELIVERY} />
        </Suspense>
      </div>
    </>
  );
}
