import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type InquiryItem = {
  slug: string;
  category: string;
  size: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
};

type InquiryPayload = {
  name?: string;
  email?: string;
  phone?: string;
  eventDate?: string;
  guests?: string | number;
  delivery?: string;
  address?: string;
  notes?: string;
  items?: InquiryItem[];
  subtotalExGst?: number;
};

export async function POST(req: Request) {
  let payload: InquiryPayload;
  try {
    payload = (await req.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (payload.name ?? "").toString().trim();
  const email = (payload.email ?? "").toString().trim();
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("cee_inquiries").insert({
    name,
    email,
    phone: payload.phone || null,
    event_date: payload.eventDate || null,
    guests: payload.guests ? Number(payload.guests) : null,
    delivery: payload.delivery || null,
    address: payload.address || null,
    notes: payload.notes || null,
    items: payload.items ?? [],
    subtotal_ex_gst: payload.subtotalExGst ?? 0,
  });

  if (error) {
    console.error("[inquiry] insert failed", error);
    return NextResponse.json({ error: "Could not save inquiry" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
