"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function setStatus(id: string, status: "new" | "read" | "replied" | "archived") {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("cee_inquiries")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${id}`);
}

export async function deleteInquiry(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("cee_inquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inbox");
  redirect("/admin/inbox");
}

export async function sendReply(inquiryId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!subject || !body) throw new Error("Subject and message are required");

  const { data: inquiry, error: fetchError } = await supabase
    .from("cee_inquiries")
    .select("id, email, name")
    .eq("id", inquiryId)
    .single();
  if (fetchError || !inquiry) throw new Error("Inquiry not found");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Christine's Exotic Eats <enquiries@christines-exoticeats.com.au>";
  const bcc = process.env.RESEND_BCC || undefined;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Add it to .env.local and restart the dev server.",
    );
  }

  const resend = new Resend(apiKey);
  const html = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 1em 0">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const { error: sendError } = await resend.emails.send({
    from,
    to: inquiry.email,
    bcc,
    replyTo: bcc, // replies from the client come back to Christine
    subject,
    text: body,
    html: `<div style="font-family:Georgia,serif;color:#2a1014;max-width:560px">${html}<hr style="border:none;border-top:1px solid #eee;margin:2em 0"/><p style="font-size:12px;color:#888">This message was sent in reply to your inquiry at Christine's Exotic Eats.</p></div>`,
  });
  if (sendError) throw new Error(sendError.message);

  await supabase.from("cee_inquiry_replies").insert({
    inquiry_id: inquiryId,
    body,
    subject,
    to_email: inquiry.email,
    sent_by_user_id: user.id,
  });
  await supabase
    .from("cee_inquiries")
    .update({ status: "replied" })
    .eq("id", inquiryId);

  revalidatePath("/admin/inbox");
  revalidatePath(`/admin/inbox/${inquiryId}`);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
