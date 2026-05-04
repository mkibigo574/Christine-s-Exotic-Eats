// Uploads per-size product photos and links each to the matching
// cee_product_sizes row via image_path / image_alt.
// Run from project root:   node scripts/import-size-images.mjs

import { readFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const IMAGES_DIR = join(PROJECT_ROOT, "Images");
const ENV_PATH = join(PROJECT_ROOT, ".env.local");

function loadEnv(path) {
  const out = {};
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

const env = loadEnv(ENV_PATH);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const BUCKET = "cee-gallery";

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uploadImage(file, slugForName) {
  const filePath = join(IMAGES_DIR, file);
  statSync(filePath);
  const buffer = readFileSync(filePath);
  const ext = file.split(".").pop().toLowerCase();
  const storagePath = `products/${Date.now()}-${slugForName}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: ext === "png" ? "image/png" : "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(`upload ${file}: ${error.message}`);
  return storagePath;
}

async function setSizeImage({ productSlug, sizeLabel, file, alt }) {
  // Resolve product ID
  const { data: product, error: pErr } = await supabase
    .from("cee_products")
    .select("id")
    .eq("slug", productSlug)
    .single();
  if (pErr || !product) throw new Error(`product '${productSlug}' not found`);

  // Resolve size row
  const { data: size, error: sErr } = await supabase
    .from("cee_product_sizes")
    .select("id")
    .eq("product_id", product.id)
    .eq("label", sizeLabel)
    .maybeSingle();
  if (sErr) throw new Error(`size lookup ${productSlug}/${sizeLabel}: ${sErr.message}`);
  if (!size) {
    console.log(`  SKIP — no size '${sizeLabel}' on '${productSlug}'`);
    return;
  }

  const slugName = `${productSlug}-${slugify(sizeLabel)}`;
  const storagePath = await uploadImage(file, slugName);
  const { error: upErr } = await supabase
    .from("cee_product_sizes")
    .update({ image_path: storagePath, image_alt: alt })
    .eq("id", size.id);
  if (upErr) throw new Error(`update size: ${upErr.message}`);
  console.log(`  ${productSlug} / ${sizeLabel} → ${storagePath}`);
}

const assignments = [
  // Fruit Boxes
  { productSlug: "fruit-boxes", sizeLabel: "Small", file: "Small Fruit Box.jpeg", alt: "Small Fruit Box with sliced seasonal fruit" },
  { productSlug: "fruit-boxes", sizeLabel: "Large", file: "Large Fruit Box.jpeg", alt: "Large Fruit Box with sliced seasonal fruit" },
  { productSlug: "fruit-boxes", sizeLabel: "Extra Large / round tray", file: "Extra Large Fruit Box.jpeg", alt: "Extra Large Fruit Box / round tray" },
  { productSlug: "fruit-boxes", sizeLabel: "Gigantic round tray", file: "Gigantic Fruit Platter.jpeg", alt: "Gigantic round fruit platter" },

  // Grazing Boxes
  { productSlug: "grazing-boxes", sizeLabel: "Small", file: "Small Grazing Box.jpeg", alt: "Small Grazing Box with cheeses, cured meats and dips" },
  { productSlug: "grazing-boxes", sizeLabel: "Large", file: "Large Grazing Box.jpeg", alt: "Large Grazing Box with cheeses, cured meats and dips" },
  { productSlug: "grazing-boxes", sizeLabel: "Extra Large", file: "Extra Large Gazing Box.jpeg", alt: "Extra Large Grazing Box with cheeses, cured meats and dips" },

  // Sandwich Box
  { productSlug: "sandwich-box", sizeLabel: "Large", file: "Large Sandwich Box.jpeg", alt: "Large Sandwich Box" },
  { productSlug: "sandwich-box", sizeLabel: "Extra Large", file: "Extra Large Sandwich Box.jpeg", alt: "Extra Large Sandwich Box" },

  // Sandwich & Wrap Boxes
  { productSlug: "sandwich-wrap-boxes", sizeLabel: "Large", file: "Large Sandwich & Wrap Box.jpeg", alt: "Large Sandwich and Wrap Box" },
  { productSlug: "sandwich-wrap-boxes", sizeLabel: "Extra Large", file: "Extra Large Sandwich & Wrap Box.jpeg", alt: "Extra Large Sandwich and Wrap Box" },

  // Sweet Box (no XL image provided)
  { productSlug: "sweet-box", sizeLabel: "Small", file: "Small Sweet Box.jpeg", alt: "Small Sweet Box" },
  { productSlug: "sweet-box", sizeLabel: "Large", file: "Large Sweet Box.jpeg", alt: "Large Sweet Box" },

  // Fruit & Sweet Box
  { productSlug: "fruit-sweet-box", sizeLabel: "Large", file: "Large Fruit & Sweet Box.jpeg", alt: "Large Fruit and Sweet Box" },
  { productSlug: "fruit-sweet-box", sizeLabel: "Extra Large", file: "Extra Large Fruit & Sweet Box.jpeg", alt: "Extra Large Fruit and Sweet Box" },

  // Fairy Bread Box
  { productSlug: "fairy-bread-box", sizeLabel: "Large", file: "Large Fairy Bread Box.jpeg", alt: "Large Fairy Bread Box" },
  { productSlug: "fairy-bread-box", sizeLabel: "Extra Large", file: "Extra Large Fairy Bread Box.jpeg", alt: "Extra Large Fairy Bread Box" },

  // Hot Savoury Boxes
  { productSlug: "hot-savoury-boxes", sizeLabel: "Large", file: "Large Savoury Box.jpeg", alt: "Large Hot Savoury Box" },
  { productSlug: "hot-savoury-boxes", sizeLabel: "Extra Large", file: "Extra Large Hot Savoury Box.jpeg", alt: "Extra Large Hot Savoury Box" },

  // Banana Bread & Scones Box (single size)
  { productSlug: "banana-bread-scones-box", sizeLabel: "Extra Large", file: "Scones & Banana Bread Box.jpeg", alt: "Scones and banana bread box" },
];

for (const a of assignments) {
  await setSizeImage(a);
}
console.log("Done.");
