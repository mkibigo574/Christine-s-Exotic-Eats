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

async function uploadProductImage(file: File, folder = "products"): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(file.name)}.${ext}`;
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
  serves?: string | null;
  notes?: string | null;
  sort_order?: number;
  min_qty?: number | null;
  image_path?: string | null;
  image_alt?: string | null;
};

async function parseSizes(formData: FormData): Promise<{
  sizes: SizeInput[];
  uploadedPaths: string[];
}> {
  const labels = formData.getAll("size_label[]") as string[];
  const prices = formData.getAll("size_price[]") as string[];
  const units = formData.getAll("size_unit[]") as string[];
  const serves = formData.getAll("size_serves[]") as string[];
  const notes = formData.getAll("size_notes[]") as string[];
  const minQtys = formData.getAll("size_min_qty[]") as string[];
  const ids = formData.getAll("size_id[]") as string[];
  const existingImages = formData.getAll("size_existing_image[]") as string[];
  const removeImages = formData.getAll("size_remove_image[]") as string[];
  const imageAlts = formData.getAll("size_image_alt[]") as string[];
  const imageFiles = formData.getAll("size_image[]") as (File | string)[];

  const sizes: SizeInput[] = [];
  const uploadedPaths: string[] = [];

  for (let i = 0; i < labels.length; i++) {
    const label = (labels[i] ?? "").trim();
    if (!label) continue;
    const priceNum = Number(prices[i]);
    if (!isFinite(priceNum)) continue;

    const minQtyRaw = (minQtys[i] ?? "").trim();
    const minQty = minQtyRaw === "" ? null : Number(minQtyRaw);

    const existing = (existingImages[i] ?? "").trim() || null;
    const remove = (removeImages[i] ?? "") === "1";
    const file = imageFiles[i];

    let image_path: string | null = existing;
    if (file && typeof file !== "string" && file.size > 0) {
      const uploaded = await uploadProductImage(file, "product-sizes");
      uploadedPaths.push(uploaded);
      image_path = uploaded;
    } else if (remove) {
      image_path = null;
    }

    sizes.push({
      id: ids[i] || undefined,
      label,
      price: priceNum,
      unit: (units[i] || "").trim() || null,
      serves: (serves[i] || "").trim() || null,
      notes: (notes[i] || "").trim() || null,
      sort_order: (i + 1) * 10,
      min_qty: minQty && isFinite(minQty) && minQty > 0 ? Math.floor(minQty) : null,
      image_path,
      image_alt: (imageAlts[i] || "").trim() || null,
    });
  }

  return { sizes, uploadedPaths };
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

  const { sizes, uploadedPaths } = await parseSizes(formData);

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
    for (const p of uploadedPaths) await deleteStoredImage(p);
    throw new Error(error?.message ?? "Could not create product");
  }

  if (sizes.length > 0) {
    const { error: sizesError } = await supabase
      .from("cee_product_sizes")
      .insert(sizes.map((s) => ({ ...s, id: undefined, product_id: product.id })));
    if (sizesError) {
      for (const p of uploadedPaths) await deleteStoredImage(p);
      throw new Error(sizesError.message);
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalogue", "layout");
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

  // Snapshot existing size image paths so we can clean up any that are no longer referenced.
  const { data: existingSizeRows } = await supabase
    .from("cee_product_sizes")
    .select("image_path")
    .eq("product_id", productId);
  const previousSizePaths = (existingSizeRows ?? [])
    .map((r) => r.image_path as string | null)
    .filter((p): p is string => Boolean(p));

  const { sizes, uploadedPaths } = await parseSizes(formData);

  const { error } = await supabase
    .from("cee_products")
    .update(update)
    .eq("id", productId);
  if (error) {
    if (typeof nextPath === "string") await deleteStoredImage(nextPath);
    for (const p of uploadedPaths) await deleteStoredImage(p);
    throw new Error(error.message);
  }

  if (nextPath !== undefined && previousPath && previousPath !== nextPath) {
    await deleteStoredImage(previousPath);
  }

  // Replace strategy: delete all and re-insert. Simpler than diffing for this scale.
  await supabase.from("cee_product_sizes").delete().eq("product_id", productId);
  if (sizes.length > 0) {
    const { error: sizesError } = await supabase
      .from("cee_product_sizes")
      .insert(sizes.map((s) => ({ ...s, id: undefined, product_id: productId })));
    if (sizesError) {
      for (const p of uploadedPaths) await deleteStoredImage(p);
      throw new Error(sizesError.message);
    }
  }

  // Delete any size images that the new set no longer references.
  const keptPaths = new Set(sizes.map((s) => s.image_path).filter((p): p is string => Boolean(p)));
  for (const oldPath of previousSizePaths) {
    if (!keptPaths.has(oldPath)) await deleteStoredImage(oldPath);
  }

  revalidatePath("/admin/products");
  revalidatePath("/catalogue", "layout");
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
  const { data: existingSizeRows } = await supabase
    .from("cee_product_sizes")
    .select("image_path")
    .eq("product_id", productId);
  const { error } = await supabase.from("cee_products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  if (existing?.image_path) await deleteStoredImage(existing.image_path);
  for (const row of existingSizeRows ?? []) {
    const p = row.image_path as string | null;
    if (p) await deleteStoredImage(p);
  }
  revalidatePath("/admin/products");
  revalidatePath("/catalogue", "layout");
  revalidatePath("/");
}
