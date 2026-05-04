"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GALLERY_BUCKET } from "@/lib/content-types";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
}

async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "jpg";
  const path = `products/${Date.now()}-${safeName(file.name)}.${ext}`;
  const admin = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(GALLERY_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

async function deleteStoredImage(path: string | null | undefined) {
  if (!path) return;
  const admin = createSupabaseAdminClient();
  await admin.storage.from(GALLERY_BUCKET).remove([path]);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SizeInput = {
  id?: string;
  label: string;
  price: number;
  unit?: string | null;
  notes?: string | null;
  sort_order?: number;
};

function parseSizes(formData: FormData): SizeInput[] {
  const sizes: SizeInput[] = [];
  const labels = formData.getAll("size_label[]") as string[];
  const prices = formData.getAll("size_price[]") as string[];
  const units = formData.getAll("size_unit[]") as string[];
  const notes = formData.getAll("size_notes[]") as string[];
  const ids = formData.getAll("size_id[]") as string[];
  for (let i = 0; i < labels.length; i++) {
    const label = (labels[i] ?? "").trim();
    if (!label) continue;
    const priceNum = Number(prices[i]);
    if (!isFinite(priceNum)) continue;
    sizes.push({
      id: ids[i] || undefined,
      label,
      price: priceNum,
      unit: (units[i] || "").trim() || null,
      notes: (notes[i] || "").trim() || null,
      sort_order: (i + 1) * 10,
    });
  }
  return sizes;
}

export async function createProduct(formData: FormData) {
  const supabase = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const slug = (String(formData.get("slug") ?? "").trim() || slugify(name));
  const blurb = String(formData.get("blurb") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
  const imageAlt = String(formData.get("image_alt") ?? "").trim() || null;

  const file = formData.get("image") as File | null;
  let imagePath: string | null = null;
  if (file && file.size > 0) {
    imagePath = await uploadProductImage(file);
  }

  const { data: product, error } = await supabase
    .from("cee_products")
    .insert({
      slug,
      name,
      blurb,
      notes,
      sort_order: sortOrder,
      is_active: true,
      image_path: imagePath,
      image_alt: imageAlt,
    })
    .select("id")
    .single();
  if (error || !product) {
    if (imagePath) await deleteStoredImage(imagePath);
    throw new Error(error?.message ?? "Could not create product");
  }

  const sizes = parseSizes(formData);
  if (sizes.length > 0) {
    await supabase
      .from("cee_product_sizes")
      .insert(sizes.map((s) => ({ ...s, id: undefined, product_id: product.id })));
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const isActive = formData.get("is_active") === "on";
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
  const imageAlt = String(formData.get("image_alt") ?? "").trim() || null;
  const removeImage = formData.get("remove_image") === "on";
  if (!name || !slug) throw new Error("Name and slug are required");

  const { data: existing } = await supabase
    .from("cee_products")
    .select("image_path")
    .eq("id", productId)
    .single();
  const previousPath = existing?.image_path as string | null | undefined;

  const file = formData.get("image") as File | null;
  let nextPath: string | null | undefined = undefined; // undefined = keep existing
  if (file && file.size > 0) {
    nextPath = await uploadProductImage(file);
  } else if (removeImage) {
    nextPath = null;
  }

  const update: Record<string, unknown> = {
    name,
    slug,
    blurb,
    notes,
    is_active: isActive,
    sort_order: sortOrder,
    image_alt: imageAlt,
  };
  if (nextPath !== undefined) update.image_path = nextPath;

  const { error } = await supabase
    .from("cee_products")
    .update(update)
    .eq("id", productId);
  if (error) {
    if (typeof nextPath === "string") await deleteStoredImage(nextPath);
    throw new Error(error.message);
  }

  // If image was replaced or removed, drop the old file
  if (nextPath !== undefined && previousPath && previousPath !== nextPath) {
    await deleteStoredImage(previousPath);
  }

  const sizes = parseSizes(formData);
  // Replace strategy: delete all and re-insert. Simpler than diffing for this scale.
  await supabase.from("cee_product_sizes").delete().eq("product_id", productId);
  if (sizes.length > 0) {
    await supabase
      .from("cee_product_sizes")
      .insert(sizes.map((s) => ({ ...s, id: undefined, product_id: productId })));
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await requireUser();
  const { data: existing } = await supabase
    .from("cee_products")
    .select("image_path")
    .eq("id", productId)
    .single();
  const { error } = await supabase.from("cee_products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  if (existing?.image_path) await deleteStoredImage(existing.image_path);
  revalidatePath("/admin/products");
  revalidatePath("/catalogue");
  revalidatePath("/");
}
