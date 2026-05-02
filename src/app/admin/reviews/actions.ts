"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return supabase;
}

function parse(formData: FormData) {
  const quote = String(formData.get("quote") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const context = String(formData.get("context") ?? "").trim() || null;
  const sourceRaw = String(formData.get("source") ?? "Facebook");
  const source = (["Facebook", "Google", "Direct"].includes(sourceRaw) ? sourceRaw : "Facebook") as
    | "Facebook" | "Google" | "Direct";
  const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;
  const isPublished = formData.get("is_published") === "on";
  if (!quote || !author) throw new Error("Quote and author are required");
  return { quote, author, context, source, sort_order: sortOrder, is_published: isPublished };
}

function revalidateAll() {
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function createReview(formData: FormData) {
  const supabase = await requireUser();
  const { error } = await supabase.from("cee_reviews").insert(parse(formData));
  if (error) throw new Error(error.message);
  revalidateAll();
  redirect("/admin/reviews");
}

export async function updateReview(id: string, formData: FormData) {
  const supabase = await requireUser();
  const { error } = await supabase.from("cee_reviews").update(parse(formData)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
  redirect("/admin/reviews");
}

export async function deleteReview(id: string) {
  const supabase = await requireUser();
  const { error } = await supabase.from("cee_reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}
