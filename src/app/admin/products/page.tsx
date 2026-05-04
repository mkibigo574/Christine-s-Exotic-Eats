import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatPrice, GALLERY_BUCKET } from "@/lib/content";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("cee_products")
    .select(
      "id, slug, name, blurb, is_active, sort_order, image_path, image_alt, cee_product_sizes(label, price, sort_order)",
    )
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[var(--color-wine-deep)]">Products</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            The boxed range shown on the catalogue and home pages.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">+ New product</Link>
      </div>

      <div className="mt-8 card divide-y divide-[var(--color-line)]">
        {(products ?? []).map((p) => {
          const sizes = (p.cee_product_sizes ?? [])
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          const min = sizes.length > 0 ? Math.min(...sizes.map((s) => Number(s.price))) : null;
          const imageUrl = p.image_path
            ? supabase.storage.from(GALLERY_BUCKET).getPublicUrl(p.image_path).data.publicUrl
            : null;
          return (
            <div key={p.id} className="p-5 flex flex-wrap items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream-soft)] grid place-items-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt=""
                    width={64}
                    height={64}
                    quality={90}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[var(--color-muted)]">No image</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl text-[var(--color-wine-dark)]">{p.name}</h2>
                  {!p.is_active ? (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] border border-[var(--color-line)] rounded-full px-2 py-0.5">
                      Hidden
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted)] line-clamp-1">{p.blurb}</p>
                <div className="mt-1 text-xs text-[var(--color-muted)]">
                  /{p.slug} · {sizes.length} size{sizes.length === 1 ? "" : "s"}
                  {min !== null ? ` · from ${formatPrice(min)}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/products/${p.id}`} className="btn-ghost text-xs !py-2 !px-4">Edit</Link>
                <DeleteProductButton id={p.id} name={p.name} />
              </div>
            </div>
          );
        })}
        {(!products || products.length === 0) ? (
          <div className="p-10 text-center text-[var(--color-muted)]">No products yet — add your first.</div>
        ) : null}
      </div>
    </div>
  );
}
