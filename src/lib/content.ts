import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  GALLERY_BUCKET,
  type Category,
  type GalleryImage,
  type Review,
} from "@/lib/content-types";

export {
  FEEDING_ESTIMATES,
  DELIVERY,
  GALLERY_BUCKET,
  formatPrice,
} from "@/lib/content-types";
export type { Category, GalleryImage, Review, Size } from "@/lib/content-types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cee_products")
    .select(
      "id, slug, name, blurb, notes, sort_order, is_active, image_path, image_alt, cee_product_sizes(id, label, price, unit, serves, notes, sort_order, image_path, image_alt, min_qty)",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return data.map((p) => {
    const image_url = p.image_path
      ? supabase.storage.from(GALLERY_BUCKET).getPublicUrl(p.image_path).data.publicUrl
      : null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      blurb: p.blurb,
      notes: p.notes,
      is_active: p.is_active,
      sort_order: p.sort_order,
      image_path: p.image_path,
      image_alt: p.image_alt,
      image_url,
      sizes: (p.cee_product_sizes ?? [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((s) => ({
          id: s.id,
          label: s.label,
          price: Number(s.price),
          unit: s.unit,
          serves: s.serves,
          notes: s.notes,
          sort_order: s.sort_order,
          image_path: s.image_path,
          image_alt: s.image_alt,
          image_url: s.image_path
            ? supabase.storage.from(GALLERY_BUCKET).getPublicUrl(s.image_path).data.publicUrl
            : null,
          min_qty: s.min_qty,
        })),
    };
  });
}

export async function findCategory(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function getReviews(): Promise<Review[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cee_reviews")
    .select("id, quote, author, context, source, is_published, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as Review[];
}

export async function getGallery(): Promise<GalleryImage[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cee_gallery_images")
    .select("id, storage_path, caption, alt, shape, sort_order, is_published")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => {
    const { data: pub } = supabase.storage
      .from(GALLERY_BUCKET)
      .getPublicUrl(row.storage_path);
    return {
      ...row,
      url: pub.publicUrl,
    } as GalleryImage;
  });
}
