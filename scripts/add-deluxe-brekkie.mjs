// One-shot migration:
//   1. Rename existing Hot Brekkie Box → "Hot Brekkie Box — Classic", drop price to $12.
//   2. Insert new "Hot Brekkie Box — Deluxe" at $16/person, min 10.
//   3. Print the new product's id so the photo can be attached next.
//
// Run:  node scripts/add-deluxe-brekkie.mjs
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

const CLASSIC_SLUG = "hot-brekkie-box";
const DELUXE_SLUG = "hot-brekkie-box-deluxe";

// 1. Rename & re-price the existing hot brekkie.
{
  const { data: existing, error: lookupErr } = await supabase
    .from("cee_products")
    .select("id, sort_order")
    .eq("slug", CLASSIC_SLUG)
    .single();
  if (lookupErr || !existing) {
    throw new Error(`Could not find existing product '${CLASSIC_SLUG}': ${lookupErr?.message}`);
  }

  const { error: nameErr } = await supabase
    .from("cee_products")
    .update({
      name: "Hot Brekkie Box — Classic",
      blurb: "Bacon and egg crumpet with potato gems.",
    })
    .eq("id", existing.id);
  if (nameErr) throw new Error(`rename classic: ${nameErr.message}`);

  const { error: priceErr } = await supabase
    .from("cee_product_sizes")
    .update({ price: 12 })
    .eq("product_id", existing.id);
  if (priceErr) throw new Error(`reprice classic: ${priceErr.message}`);

  console.log(`✓ Renamed existing hot brekkie → 'Hot Brekkie Box — Classic' @ $12 (id ${existing.id})`);

  // 2. Insert the new deluxe product, sort_order just after classic.
  const { data: existingDeluxe } = await supabase
    .from("cee_products")
    .select("id")
    .eq("slug", DELUXE_SLUG)
    .maybeSingle();
  if (existingDeluxe) {
    console.log(`(deluxe already exists at id ${existingDeluxe.id}; leaving in place)`);
    process.exit(0);
  }

  const { data: deluxe, error: deluxeErr } = await supabase
    .from("cee_products")
    .insert({
      slug: DELUXE_SLUG,
      name: "Hot Brekkie Box — Deluxe",
      blurb:
        "A loaded hot breakfast tray — bacon, sausages, eggs, roasted tomatoes, sautéed mushrooms, potato gems and English muffins.",
      notes: "Minimum of 10 portions per order.",
      is_active: true,
      sort_order: (existing.sort_order ?? 25) + 1,
    })
    .select("id")
    .single();
  if (deluxeErr || !deluxe) throw new Error(`insert deluxe: ${deluxeErr?.message}`);

  const { error: sizeErr } = await supabase.from("cee_product_sizes").insert({
    product_id: deluxe.id,
    label: "Standard",
    unit: "per person",
    price: 16,
    min_qty: 10,
    sort_order: 10,
  });
  if (sizeErr) throw new Error(`insert deluxe size: ${sizeErr.message}`);

  console.log(`✓ Created 'Hot Brekkie Box — Deluxe' @ $16/person, min 10 (id ${deluxe.id})`);
  console.log("\nNext step: save the deluxe photo into /Images and run scripts/set-deluxe-image.mjs");
}
