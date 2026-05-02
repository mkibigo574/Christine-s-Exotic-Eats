import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GALLERY_BUCKET } from "@/lib/content";
import { uploadGalleryImage, updateGalleryImage } from "./actions";
import { GalleryRowActions } from "./GalleryRowActions";

export const dynamic = "force-dynamic";

export default async function GalleryAdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("cee_gallery_images")
    .select("id, storage_path, caption, alt, shape, sort_order, is_published")
    .order("sort_order", { ascending: true });

  const images = (rows ?? []).map((r) => {
    const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(r.storage_path);
    return { ...r, url: data.publicUrl };
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-wine-deep)]">Gallery</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Upload photos of past events and signature boxes.
      </p>

      <section className="mt-8 card p-6">
        <h2 className="font-display text-xl text-[var(--color-wine-dark)]">Upload a new photo</h2>
        <form
          action={uploadGalleryImage}
          encType="multipart/form-data"
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <label className="grid gap-1.5 md:col-span-2">
            <span className="text-overline">Image *</span>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-wine)] file:text-[var(--color-cream-soft)] file:px-4 file:py-1.5 file:text-xs"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-overline">Caption</span>
            <input name="caption" placeholder="e.g. Corporate function, Darwin" className="input" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-overline">Alt text (accessibility)</span>
            <input name="alt" placeholder="Describe the photo for screen readers" className="input" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-overline">Shape on grid</span>
            <select name="shape" defaultValue="square" className="input">
              <option value="square">Square</option>
              <option value="tall">Tall (2 rows)</option>
              <option value="wide">Wide (2 cols)</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-overline">Sort order</span>
            <input name="sort_order" type="number" defaultValue={0} className="input" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary">Upload photo</button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-[var(--color-wine-dark)]">Photos</h2>
        {images.length === 0 ? (
          <div className="mt-4 card p-10 text-center text-[var(--color-muted)]">
            No photos yet — upload your first above.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <div key={img.id} className="card overflow-hidden">
                <div className="relative aspect-[4/3] bg-[var(--color-cream-dark)]">
                  <Image
                    src={img.url}
                    alt={img.alt ?? img.caption ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <form
                  action={updateGalleryImage.bind(null, img.id)}
                  className="p-4 grid gap-3"
                >
                  <label className="grid gap-1">
                    <span className="text-overline">Caption</span>
                    <input name="caption" defaultValue={img.caption ?? ""} className="input !py-2" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-overline">Alt text</span>
                    <input name="alt" defaultValue={img.alt ?? ""} className="input !py-2" />
                  </label>
                  <div className="grid gap-3 grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-overline">Shape</span>
                      <select name="shape" defaultValue={img.shape} className="input !py-2">
                        <option value="square">Square</option>
                        <option value="tall">Tall</option>
                        <option value="wide">Wide</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-overline">Sort</span>
                      <input
                        name="sort_order"
                        type="number"
                        defaultValue={img.sort_order}
                        className="input !py-2"
                      />
                    </label>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="is_published"
                      defaultChecked={img.is_published}
                      className="h-4 w-4"
                    />
                    <span>Visible on site</span>
                  </label>
                  <GalleryRowActions id={img.id} />
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

