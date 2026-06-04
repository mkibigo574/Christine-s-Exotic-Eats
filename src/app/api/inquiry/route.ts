import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  // Cloudflare Turnstile token, set by the widget on the client.
  turnstileToken?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT = 2000;

// --- Layer 3 helpers: content & shape checks (centralised in isSpam) ---

// Links / contact-bait dropped into free-text fields that aren't URL fields.
const LINK_RE = /(https?:\/\/|www\.\w|t\.me\/|wa\.me\/|\btelegram\b|bit\.ly|tinyurl|\.ru\b)/i;
// Obvious scam / spam copy.
const SPAM_PHRASE_RE =
  /(free sex|chat me|click here|viagra|cialis|casino|\bcrypto\b|bitcoin|\bbtc\b|\bseo\b|backlinks|escort|porn)/i;

// Keyboard-mash text: 4+ letters with no vowel at all.
function looksGibberish(s: string): boolean {
  const letters = s.replace(/[^a-zA-Z]/g, "");
  return letters.length >= 4 && !/[aeiouy]/i.test(letters);
}

// Returns true if the submission shows bot/spam signals. Rejections for these
// are silent (fake 200) so bots get no feedback to tune against. Keep all such
// checks here so the list is easy to extend.
function isSpam(p: InquiryPayload): boolean {
  // Free-text fields a bot tends to stuff with links / scam copy.
  const textFields = [p.name, p.eventType, p.address, p.notes, p.delivery];
  for (const raw of textFields) {
    const v = (raw ?? "").toString();
    if (!v) continue;
    if (LINK_RE.test(v)) return true;
    if (SPAM_PHRASE_RE.test(v)) return true;
  }
  // Random keyboard-mash names (real names always contain a vowel).
  if (p.name && looksGibberish(p.name.toString().trim())) return true;
  return false;
}

// --- Layer 4: in-memory per-IP rate limiter ---
// Catches bursts that hit the same warm serverless instance. Combined with the
// honeypot, Turnstile and content checks this stops the bulk of bot traffic.
// Swap for a shared store (Upstash/Vercel KV) if rotation-heavy abuse appears.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (ipHits.size > 5000) {
    for (const [key, times] of ipHits) {
      const fresh = times.filter((t) => now - t < RATE_WINDOW_MS);
      if (fresh.length === 0) ipHits.delete(key);
      else ipHits.set(key, fresh);
    }
  }
  return hits.length > RATE_LIMIT;
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// --- Layer 2: Cloudflare Turnstile verification ---
async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // If no secret is configured (e.g. local dev), skip verification rather than
  // block legitimate submissions. The widget is also hidden client-side when no
  // site key is set, so the two stay in sync.
  if (!secret) {
    console.warn("[inquiry] TURNSTILE_SECRET_KEY not set — skipping CAPTCHA verification");
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[inquiry] Turnstile verify failed", err);
    return false;
  }
}

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

  const ip = getClientIp(req);

  // Layer 1 — honeypot. Silently drop: the field is invisible to real users.
  if (payload.website && payload.website.toString().trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Layer 4 — rate limit. Silently drop bursts so a single source can't blast.
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: true });
  }

  // Honest validation a real user could trip (returns real 4xx with a message).
  const name = clampText(payload.name, 120);
  const email = clampText(payload.email, 200);
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const phone = clampText(payload.phone, 60);
  const phoneDigits = (phone ?? "").replace(/\D/g, "");
  if (!phone || phoneDigits.length < 8 || phoneDigits.length > 15) {
    return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }

  // Layer 3 — content spam. Silently drop (look like success to the bot).
  if (isSpam(payload)) {
    return NextResponse.json({ ok: true });
  }

  // Layer 2 — Turnstile. A real user whose token expired can hit this, so it's
  // an honest 4xx prompting a retry rather than a silent drop.
  const captchaOk = await verifyTurnstile(payload.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "Verification failed — please refresh the page and try again." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

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
    type SizeRow = {
      label: string;
      min_qty: number | null;
      cee_products: { slug: string } | { slug: string }[] | null;
    };
    const minMap = new Map<string, number>();
    for (const row of (sizesData ?? []) as unknown as SizeRow[]) {
      const product = Array.isArray(row.cee_products) ? row.cee_products[0] : row.cee_products;
      if (!product) continue;
      if (row.min_qty && row.min_qty > 1) {
        minMap.set(`${product.slug}::${row.label}`, row.min_qty);
      }
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
