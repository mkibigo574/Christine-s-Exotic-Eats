"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice, type Category } from "@/lib/content-types";
import { Mark } from "@/components/Ornament";

type DeliveryOption = { zone: string; fee: number };

type Status = "idle" | "submitting" | "success" | "error";

type Selection = Record<string, number>;

function selectionKey(slug: string, sizeLabel: string) {
  return `${slug}::${sizeLabel}`;
}

export function InquiryForm({
  categories,
  delivery,
}: {
  categories: Category[];
  delivery: DeliveryOption[];
}) {
  const params = useSearchParams();
  const initialBox = params.get("box");

  const [selection, setSelection] = useState<Selection>({});
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBox) {
      const cat = categories.find((c) => c.slug === initialBox);
      if (cat && cat.sizes[0]) {
        const first = cat.sizes[0];
        setSelection((s) => ({ ...s, [selectionKey(cat.slug, first.label)]: 1 }));
      }
    }
  }, [initialBox, categories]);

  const subtotal = useMemo(() => {
    let total = 0;
    for (const cat of categories) {
      for (const size of cat.sizes) {
        const qty = selection[selectionKey(cat.slug, size.label)] ?? 0;
        if (qty > 0) total += qty * size.price;
      }
    }
    return total;
  }, [selection, categories]);

  function setQty(slug: string, label: string, qty: number) {
    setSelection((prev) => {
      const next = { ...prev };
      const key = selectionKey(slug, label);
      if (qty <= 0) delete next[key];
      else next[key] = qty;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const items = Object.entries(selection).map(([key, qty]) => {
      const [slug, sizeLabel] = key.split("::");
      const cat = categories.find((c) => c.slug === slug);
      const size = cat?.sizes.find((s) => s.label === sizeLabel);
      return {
        slug,
        category: cat?.name ?? slug,
        size: sizeLabel,
        unitPrice: size?.price ?? 0,
        qty,
        lineTotal: (size?.price ?? 0) * qty,
      };
    });

    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      eventDate: data.get("eventDate"),
      guests: data.get("guests"),
      delivery: data.get("delivery"),
      address: data.get("address"),
      notes: data.get("notes"),
      items,
      subtotalExGst: subtotal,
    };

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setStatus("success");
      form.reset();
      setSelection({});
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-14 card p-10 text-center grain relative overflow-hidden">
        <Mark className="mx-auto text-[var(--color-gold)]" />
        <h2 className="mt-5 font-display heading-md text-[var(--color-wine-deep)]">
          Thank you — your inquiry has been received.
        </h2>
        <p className="mt-4 text-[var(--color-ink-soft)] max-w-lg mx-auto leading-relaxed">
          Christine will be in touch shortly to confirm availability. If your
          event is urgent, please follow up via Facebook or Instagram message.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 btn-ghost"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-14 grid gap-12">
      <Section title="Your details">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Full name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone" name="phone" type="tel" />
          <Field label="Event date" name="eventDate" type="date" required />
        </div>
      </Section>

      <Section title="Event details">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Approx. guest count" name="guests" type="number" min="1" />
          <SelectField label="Delivery / pick-up" name="delivery" required>
            <option value="">Select an option…</option>
            {delivery.map((d) => (
              <option key={d.zone} value={d.zone}>
                {d.zone}
                {d.fee > 0 ? ` · $${d.fee} delivery` : " · Free"}
              </option>
            ))}
          </SelectField>
        </div>
        <Field
          label="Delivery address (if applicable)"
          name="address"
          placeholder="Street, suburb, postcode"
        />
      </Section>

      <Section title="What would you like?" subtitle="Pick any combination — leave quantities at zero for items you don't want. Custom orders can be described in the notes below.">
        <div className="grid gap-3">
          {categories.map((cat) => (
            <details
              key={cat.slug}
              open={cat.sizes.some(
                (s) => (selection[selectionKey(cat.slug, s.label)] ?? 0) > 0,
              )}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream-soft)] open:shadow-[var(--shadow-soft)] transition"
            >
              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3">
                <span className="font-display text-lg text-[var(--color-wine-dark)]">
                  {cat.name}
                </span>
                <span className="text-overline">
                  From {formatPrice(Math.min(...cat.sizes.map((s) => s.price)))}
                </span>
              </summary>
              <div className="px-5 pb-5 pt-1 grid gap-1">
                {cat.sizes.map((size) => {
                  const key = selectionKey(cat.slug, size.label);
                  const qty = selection[key] ?? 0;
                  return (
                    <div
                      key={size.label}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 border-t border-[var(--color-line)] first:border-t-0"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <div className="font-display text-base text-[var(--color-ink)]">
                          {size.label}
                          {size.unit ? (
                            <span className="text-[var(--color-muted)] font-sans text-sm font-normal">
                              {" "}({size.unit})
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] mt-0.5">
                          {formatPrice(size.price)} excl. GST
                        </div>
                      </div>
                      <QtyControl
                        value={qty}
                        onChange={(v) => setQty(cat.slug, size.label, v)}
                      />
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
        {subtotal > 0 ? (
          <div className="rounded-2xl bg-[linear-gradient(140deg,rgba(184,138,62,0.18),rgba(247,241,230,0.6))] border border-[var(--color-line)] px-6 py-5 flex items-center justify-between">
            <div>
              <div className="text-overline">Indicative subtotal</div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">
                Excl. GST &amp; delivery
              </div>
            </div>
            <span className="font-display text-3xl text-[var(--color-wine-deep)]">
              {formatPrice(subtotal)}
            </span>
          </div>
        ) : null}
      </Section>

      <Section title="Notes">
        <textarea
          name="notes"
          rows={5}
          placeholder="Custom orders, allergies, dietary requirements, theme — anything else we should know."
          className="input w-full resize-y"
        />
      </Section>

      {error ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error} — please try again or contact us via social media.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <p className="text-xs text-[var(--color-muted)] max-w-md leading-relaxed">
          By submitting, you&rsquo;re sending an inquiry — not placing a paid
          order. Christine will reply to confirm availability before any
          payment is requested.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send inquiry"}
          <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-5">
      <div>
        <legend className="font-display text-2xl text-[var(--color-wine-deep)]">
          {title}
        </legend>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--color-muted)] max-w-2xl">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-3 hairline" />
      </div>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-overline">
        {label}
        {required ? <span className="text-[var(--color-wine)]"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        className="input"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  required = false,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-overline">
        {label}
        {required ? <span className="text-[var(--color-wine)]"> *</span> : null}
      </span>
      <select name={name} required={required} defaultValue="" className="input">
        {children}
      </select>
    </label>
  );
}

function QtyControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] shadow-[var(--shadow-soft)]">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 grid place-items-center text-[var(--color-wine)] hover:bg-[var(--color-cream-dark)]/50 rounded-l-full"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-9 text-center font-display text-lg tabular-nums text-[var(--color-wine-dark)]">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 grid place-items-center text-[var(--color-wine)] hover:bg-[var(--color-cream-dark)]/50 rounded-r-full"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
