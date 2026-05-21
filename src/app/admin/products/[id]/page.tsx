import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductForm } from "../ProductForm";
import { updateProduct } from "../actions";
import { GALLERY_BUCKET, type Category } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cee_products")
    .select(
      "id, slug, name, blurb, notes, is_active, sort_order, image_path, image_alt, cee_product_sizes(id, label, price, unit, serves, notes, sort_order, image_path, image_alt, min_qty)",
    )
    .eq("id", id)
    .single();
  if (!data) notFound();

  const image_url = data.image_path
    ? supabase.storage.from(GALLERY_BUCKET).getPublicUrl(data.image_path).data.publicUrl
    : null;

  const initial: Category = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    blurb: data.blurb,
    notes: data.notes,
    is_active: data.is_active,
    sort_order: data.sort_order,
    image_path: data.image_path,
    image_alt: data.image_alt,
    image_url,
    sizes: (data.cee_product_sizes ?? [])
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

  const action = updateProduct.bind(null, id);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Back to products
      </Link>
      <h1 className="mt-3 font-display text-3xl text-[var(--color-wine-deep)]">Edit product</h1>
      <div className="mt-8">
        <ProductForm action={action} initial={initial} submitLabel="Save changes" />
      </div>
    </div>
  );
}
