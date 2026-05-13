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
  eventType?: string;
  guests?: string | number;
  delivery?: string;
  deliveryTime?: string;
  address?: string;
  notes?: string;
  items?: InquiryItem[];
  subtotalExGst?: number;
  // Honeypot — bots typically autofill every field; humans never see this.
  website?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 2000;

function clampText(v: unknown, max = 200): string | null {
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  let payload: InquiryPayload;
  try {
    payload = (await req.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Silently drop bot submissions: the honeypot is invisible to real users.
  if (payload.website && payload.website.toString().trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = clampText(payload.name, 120);
  const email = clampText(payload.email, 200);
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const items = (payload.items ?? []).filter((it) => it && it.qty > 0);
  if (items.length > 0) {
    const slugs = [...new Set(items.map((it) => it.slug))];
    const { data: sizesData, error: sizesError } = await supabase
      .from("cee_product_sizes")
      .select("label, min_qty, cee_products!inner(slug)")
      .in("cee_products.slug", slugs);
    if (sizesError) {
      console.error("[inquiry] min_qty lookup failed", sizesError);
      return NextResponse.json({ error: "Could not validate order" }, { status: 500 });
    }
    const minMap = new Map<string, number>();
    for (const row of sizesData ?? []) {
      const slug = (row as { cee_products: { slug: string } }).cee_products.slug;
      const label = (row as { label: string }).label;
      const min = (row as { min_qty: number | null }).min_qty;
      if (min && min > 1) minMap.set(`${slug}::${label}`, min);
    }
    const violations: string[] = [];
    for (const it of items) {
      const min = minMap.get(`${it.slug}::${it.size}`);
      if (min && it.qty < min) {
        violations.push(`${it.category} — ${it.size} (min ${min}, got ${it.qty})`);
      }
    }
    if (violations.length > 0) {
      return NextResponse.json(
        { error: `Minimum order quantity not met: ${violations.join("; ")}` },
        { status: 400 },
      );
    }
  }

  const { error } = await supabase.from("cee_inquiries").insert({
    name,
    email,
    phone: clampText(payload.phone, 60),
    event_date: clampText(payload.eventDate, 40),
    event_type: clampText(payload.eventType, 120),
    guests: payload.guests ? Number(payload.guests) : null,
    delivery: clampText(payload.delivery, 120),
    delivery_time: clampText(payload.deliveryTime, 40),
    address: clampText(payload.address, 300),
    notes: clampText(payload.notes, MAX_TEXT),
    items: payload.items ?? [],
    subtotal_ex_gst: payload.subtotalExGst ?? 0,
  });

  if (error) {
    console.error("[inquiry] insert failed", error);
    return NextResponse.json({ error: "Could not save enquiry" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
