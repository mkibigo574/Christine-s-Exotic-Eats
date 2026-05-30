"use client";

import { useActionState, useState } from "react";
import type { Category, Size } from "@/lib/content-types";
import type { ProductFormState } from "./actions";
import { downscaleImageInput } from "@/lib/downscale-image";

type Props = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  initial?: Category;
  submitLabel: string;
};

type SizeImageState = {
  preview: string | null;
  remove: boolean;
};

export function ProductForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const [sizes, setSizes] = useState<Size[]>(
    initial?.sizes ?? [{ label: "", price: 0 }],
  );
  const [sizeImages, setSizeImages] = useState<SizeImageState[]>(
    (initial?.sizes ?? [{ label: "", price: 0 }]).map((s) => ({
      preview: s.image_url ?? null,
      remove: false,
    })),
  );
  const [preview, setPreview] = useState<string | null>(initial?.image_url ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const hasInitialImage = Boolean(initial?.image_url);

  function update(i: number, key: keyof Size, value: string | number) {
    setSizes((arr) => arr.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  }
  function add() {
    setSizes((arr) => [...arr, { label: "", price: 0 }]);
    setSizeImages((arr) => [...arr, { preview: null, remove: false }]);
  }
  function remove(i: number) {
    setSizes((arr) => arr.filter((_, idx) => idx !== i));
    setSizeImages((arr) => arr.filter((_, idx) => idx !== i));
  }
  async function pickSizeImage(i: number, input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    const scaled = await downscaleImageInput(input, file);
    setSizeImages((arr) =>
      arr.map((s, idx) =>
        idx === i ? { preview: URL.createObjectURL(scaled), remove: false } : s,
      ),
    );
  }
  function toggleRemoveSizeImage(i: number, removeIt: boolean) {
    setSizeImages((arr) =>
      arr.map((s, idx) => {
        if (idx !== i) return s;
        const original = sizes[idx]?.image_url ?? null;
        return {
          preview: removeIt ? null : original,
          remove: removeIt,
        };
      }),
    );
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const scaled = await downscaleImageInput(input, file);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(scaled));
  }

  return (
    <form action={formAction} className="grid gap-6">
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

      <div className="grid gap-3">
        <span className="text-overline">Product image</span>
        <p className="text-xs text-[var(--color-muted)] -mt-1 max-w-xl leading-relaxed">
          Upload the largest, sharpest photo you have — JPEG, PNG or WebP, ideally 2000px wide or larger. The site renders responsive AVIF/WebP automatically and never up-scales.
        </p>
        <div className="grid gap-4 md:grid-cols-[200px_1fr] items-start">
          <div className="aspect-[4/5] w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream-soft)] overflow-hidden grid place-items-center">
            {preview && !removeImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-[var(--color-muted)] text-center px-3">
                No image selected
              </span>
            )}
          </div>
          <div className="grid gap-3">
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={onPick}
              className="block text-sm file:mr-3 file:rounded-full file:border file:border-[var(--color-line)] file:bg-[var(--color-paper)] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-[var(--color-wine-dark)] hover:file:bg-[var(--color-cream-dark)]/40"
            />
            <Field
              label="Image alt text"
              name="image_alt"
              defaultValue={initial?.image_alt ?? ""}
              placeholder="Describe what's in the photo (for accessibility)."
            />
            {hasInitialImage ? (
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="remove_image"
                  checked={removeImage}
                  onChange={(e) => {
                    setRemoveImage(e.target.checked);
                    if (e.target.checked) setPreview(null);
                    else setPreview(initial?.image_url ?? null);
                  }}
                  className="h-4 w-4"
                />
                <span>Remove the current image</span>
              </label>
            ) : null}
          </div>
        </div>
      </div>

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
          Prices are exclusive of GST. Add a per-piece minimum (e.g. 30) when an item is only sold in batches.
        </p>

        <div className="mt-4 grid gap-4">
          {sizes.map((s, i) => {
            const img = sizeImages[i] ?? { preview: null, remove: false };
            const hasExistingImage = Boolean(s.image_url);
            return (
              <div
                key={i}
                className="grid gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream-soft)] p-4"
              >
                <input type="hidden" name="size_id[]" value={s.id ?? ""} />
                <input type="hidden" name="size_existing_image[]" value={s.image_path ?? ""} />
                <input type="hidden" name="size_remove_image[]" value={img.remove ? "1" : ""} />

                <div className="grid gap-2 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_auto] items-end">
                  <SubField label="Label" name="size_label[]" value={s.label} onChange={(v) => update(i, "label", v)} required />
                  <SubField label="Price" name="size_price[]" type="number" step="0.01" value={String(s.price ?? 0)} onChange={(v) => update(i, "price", Number(v))} required />
                  <SubField label="Unit" name="size_unit[]" value={s.unit ?? ""} placeholder="e.g. each" onChange={(v) => update(i, "unit", v)} />
                  <SubField label="Min qty" name="size_min_qty[]" type="number" step="1" value={s.min_qty ? String(s.min_qty) : ""} placeholder="optional" onChange={(v) => update(i, "min_qty", v === "" ? 0 : Number(v))} />
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-xs text-red-700 hover:underline self-center pb-1"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <SubField label="Serves" name="size_serves[]" value={s.serves ?? ""} placeholder="e.g. 8–10 people" onChange={(v) => update(i, "serves", v)} />
                  <SubField label="Notes" name="size_notes[]" value={s.notes ?? ""} onChange={(v) => update(i, "notes", v)} />
                </div>

                <div className="grid gap-3 md:grid-cols-[140px_1fr] items-start pt-1">
                  <div className="aspect-[4/3] w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] overflow-hidden grid place-items-center">
                    {img.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] text-center px-2">
                        No photo
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label className="grid gap-1">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">Photo for this size</span>
                      <input
                        type="file"
                        name="size_image[]"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(e) => pickSizeImage(i, e.currentTarget)}
                        className="block text-xs file:mr-3 file:rounded-full file:border file:border-[var(--color-line)] file:bg-[var(--color-paper)] file:px-3 file:py-1.5 file:text-[10px] file:uppercase file:tracking-[0.18em] file:text-[var(--color-wine-dark)] hover:file:bg-[var(--color-cream-dark)]/40"
                      />
                    </label>
                    <SubField
                      label="Image alt text"
                      name="size_image_alt[]"
                      value={s.image_alt ?? ""}
                      placeholder="What's in the photo (for accessibility)."
                      onChange={(v) => update(i, "image_alt", v)}
                    />
                    {hasExistingImage ? (
                      <label className="inline-flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={img.remove}
                          onChange={(e) => toggleRemoveSizeImage(i, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span>Remove current photo</span>
                      </label>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {state.error}
        </p>
      ) : null}

      <div className="pt-2">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? "Saving…" : submitLabel}
        </button>
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
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
        {required ? <span className="text-[var(--color-wine)]"> *</span> : null}
      </span>
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
