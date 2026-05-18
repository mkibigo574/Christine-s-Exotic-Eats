// Ensures min_qty = 10 on:
//   - Substantial Sandwiches (all sizes)
//   - Hot Brekkie Box — Classic, Hot Brekkie Box — Deluxe, Cold Brekki Box (all sizes)
// Idempotent — safe to re-run.
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = (() => {
  const out = {};
  const text = readFileSync(join(resolve(__dirname, ".."), ".env.local"), "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[line.slice(0, eq).trim()] = v;
  }
  return out;
})();

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SLUGS = [
  "substantial-sandwiches",
  "hot-brekkie-box",
  "hot-brekkie-box-deluxe",
  "cold-brekki-box",
];

const { data: products, error } = await supabase
  .from("cee_products")
  .select("id, slug, name, cee_product_sizes(id, label, price, min_qty)")
  .in("slug", SLUGS);
if (error) throw error;

for (const slug of SLUGS) {
  const product = products.find((p) => p.slug === slug);
  if (!product) {
    console.log(`! product not found: ${slug}`);
    continue;
  }
  for (const size of product.cee_product_sizes ?? []) {
    if (size.min_qty === 10) {
      console.log(`  ${product.name} / ${size.label}: already min 10 ✓`);
      continue;
    }
    const { error: updErr } = await supabase
      .from("cee_product_sizes")
      .update({ min_qty: 10 })
      .eq("id", size.id);
    if (updErr) throw new Error(`update ${product.name}/${size.label}: ${updErr.message}`);
    console.log(`✓ ${product.name} / ${size.label}: was ${size.min_qty ?? "null"} → 10`);
  }
}

// Also update Substantial Sandwiches notes so the minimum is shown on the catalogue card.
const sub = products.find((p) => p.slug === "substantial-sandwiches");
if (sub) {
  const { error: notesErr } = await supabase
    .from("cee_products")
    .update({ notes: "Minimum of 10 portions per order." })
    .eq("id", sub.id);
  if (notesErr) throw notesErr;
  console.log(`✓ Substantial Sandwiches notes set to flag the 10-portion minimum`);
}
