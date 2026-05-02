import Link from "next/link";
import { createProduct } from "../actions";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="text-sm text-[var(--color-muted)] hover:underline">
        ← Back to products
      </Link>
      <h1 className="mt-3 font-display text-3xl text-[var(--color-wine-deep)]">New product</h1>
      <div className="mt-8">
        <ProductForm action={createProduct} submitLabel="Create product" />
      </div>
    </div>
  );
}
