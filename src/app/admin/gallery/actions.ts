"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GALLERY_BUCKET } from "@/lib/content";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

function revalidateAll() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uploadGalleryImage(formData: FormData) {
  const supabase = await requireUser();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Please choose an image");
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const alt = String(formData.get("alt") ?? "").trim() || null;
  const shapeRaw = String(formData.get("shape") ?? "square");
  const shape = (["square", "tall", "wide"].includes(shapeRaw) ? shapeRaw : "square") as
    | "square" | "tall" | "wide";
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${Date.now()}-${safeName(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;

  const admin = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from(GALLERY_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("cee_gallery_images").insert({
    storage_path: path,
    caption,
    alt,
    shape,
    sort_order: sortOrder,
    is_published: true,
  });
  if (insertError) {
    // Cleanup orphaned upload
    await admin.storage.from(GALLERY_BUCKET).remove([path]);
    throw new Error(insertError.message);
  }
  revalidateAll();
}

export async function updateGalleryImage(id: string, formData: FormData) {
  const supabase = await requireUser();
  const caption = String(formData.get("caption") ?? "").trim() || null;
  const alt = String(formData.get("alt") ?? "").trim() || null;
  const shapeRaw = String(formData.get("shape") ?? "square");
  const shape = (["square", "tall", "wide"].includes(shapeRaw) ? shapeRaw : "square") as
    | "square" | "tall" | "wide";
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
  const isPublished = formData.get("is_published") === "on";

  const { error } = await supabase
    .from("cee_gallery_images")
    .update({ caption, alt, shape, sort_order: sortOrder, is_published: isPublished })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteGalleryImage(id: string) {
  const supabase = await requireUser();
  const { data: row } = await supabase
    .from("cee_gallery_images")
    .select("storage_path")
    .eq("id", id)
    .single();
  await supabase.from("cee_gallery_images").delete().eq("id", id);
  if (row?.storage_path) {
    const admin = createSupabaseAdminClient();
    await admin.storage.from(GALLERY_BUCKET).remove([row.storage_path]);
  }
  revalidateAll();
}
