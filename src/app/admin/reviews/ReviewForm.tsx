import type { Review } from "@/lib/content-types";

export function ReviewForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  initial?: Review;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-5 max-w-2xl">
      <label className="grid gap-1.5">
        <span className="text-overline">Quote *</span>
        <textarea
          name="quote"
          rows={4}
          defaultValue={initial?.quote ?? ""}
          required
          className="input resize-y"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-overline">Author *</span>
          <input name="author" defaultValue={initial?.author ?? ""} required className="input" />
        </label>
        <label className="grid gap-1.5">
          <span className="text-overline">Context</span>
          <input
            name="context"
            defaultValue={initial?.context ?? ""}
            placeholder="e.g. Birthday party, Corporate function"
            className="input"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_120px_auto] md:items-center">
        <label className="grid gap-1.5">
          <span className="text-overline">Source</span>
          <select name="source" defaultValue={initial?.source ?? "Facebook"} className="input">
            <option value="Facebook">Facebook</option>
            <option value="Google">Google</option>
            <option value="Direct">Direct</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-overline">Sort order</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={String(initial?.sort_order ?? 0)}
            className="input"
          />
        </label>
        <label className="inline-flex items-center gap-2 text-sm pt-6">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={initial?.is_published ?? true}
            className="h-4 w-4"
          />
          <span>Visible on the public site</span>
        </label>
      </div>
      <div>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
