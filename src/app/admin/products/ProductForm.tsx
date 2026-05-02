"use client";

import { useState } from "react";
import type { Category, Size } from "@/lib/content-types";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  initial?: Category;
  submitLabel: string;
};

export function ProductForm({ action, initial, submitLabel }: Props) {
  const [sizes, setSizes] = useState<Size[]>(
    initial?.sizes ?? [{ label: "", price: 0 }],
  );

  function update(i: number, key: keyof Size, value: string | number) {
    setSizes((arr) => arr.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  }
  function add() {
    setSizes((arr) => [...arr, { label: "", price: 0 }]);
  }
  function remove(i: number) {
    setSizes((arr) => arr.filter((_, idx) => idx !== i));
  }

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" defaultValue={initial?.name} required />
        <Field label="Slug (URL part)" name="slug" defaultValue={initial?.slug} placeholder="auto from name" />
      </div>
      <Field
        label="Short blurb"
        name="blurb"
        defaultValue={initial?.blurb}
        placeholder="One short tagline shown under the title."
      />
      <label className="grid gap-1.5">
        <span className="text-overline">Notes (optional)</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={initial?.notes ?? ""}
          placeholder="Any small print, e.g. minimum order quantity."
          className="input resize-y"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-[120px_auto] md:items-center">
        <Field label="Sort order" name="sort_order" type="number" defaultValue={String(initial?.sort_order ?? 0)} />
        <label className="inline-flex items-center gap-2 text-sm pt-6">
          <input type="checkbox" name="is_active" defaultChecked={initial?.is_active ?? true} className="h-4 w-4" />
          <span>Visible on the public site</span>
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-[var(--color-wine-deep)]">Sizes &amp; prices</h3>
          <button type="button" onClick={add} className="btn-ghost text-xs !py-1.5 !px-3">
            + Add size
          </button>
        </div>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Prices are exclusive of GST.
        </p>

        <div className="mt-4 grid gap-3">
          {sizes.map((s, i) => (
            <div
              key={i}
              className="grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.8fr_2fr_auto] items-end rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream-soft)] p-3"
            >
              <input type="hidden" name="size_id[]" value={s.id ?? ""} />
              <SubField label="Label" name="size_label[]" value={s.label} onChange={(v) => update(i, "label", v)} required />
              <SubField label="Price" name="size_price[]" type="number" step="0.01" value={String(s.price ?? 0)} onChange={(v) => update(i, "price", Number(v))} required />
              <SubField label="Unit" name="size_unit[]" value={s.unit ?? ""} placeholder="e.g. each" onChange={(v) => update(i, "unit", v)} />
              <SubField label="Notes" name="size_notes[]" value={s.notes ?? ""} onChange={(v) => update(i, "notes", v)} />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-xs text-red-700 hover:underline self-center pb-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
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
        defaultValue={defaultValue}
        className="input"
      />
    </label>
  );
}

function SubField({
  label,
  name,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input !py-2 !px-3 text-sm"
      />
    </label>
  );
}
