// One-off importer:
//  * Uploads product photos from ../Images/ to the cee-gallery bucket
//  * Updates blurb / notes on existing cee_products rows
//  * Creates new products + sizes for items the owner sent that aren't yet in the DB
//
// Run from the project root:   node scripts/import-product-images.mjs

import { readFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const IMAGES_DIR = join(PROJECT_ROOT, "Images");
const ENV_PATH = join(PROJECT_ROOT, ".env.local");

// --- minimal .env.local loader (no dotenv dependency) ----------------------
function loadEnv(path) {
  const out = {};
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
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
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing Supabase env vars in .env.local");
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = "cee-gallery";

// --- helpers ---------------------------------------------------------------
function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadImage(filename, slugForName) {
  const filePath = join(IMAGES_DIR, filename);
  statSync(filePath); // throws if missing
  const buffer = readFileSync(filePath);
  const ext = filename.split(".").pop().toLowerCase();
  const storagePath = `products/${Date.now()}-${slugForName}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: ext === "png" ? "image/png" : "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(`upload ${filename}: ${error.message}`);
  return storagePath;
}

async function setProductImageBySlug(slug, filename, alt) {
  const storagePath = await uploadImage(filename, slug);
  const { error } = await supabase
    .from("cee_products")
    .update({ image_path: storagePath, image_alt: alt })
    .eq("slug", slug);
  if (error) throw new Error(`update ${slug} image: ${error.message}`);
  console.log(`  image set on '${slug}' → ${storagePath}`);
}

async function updateBlurbNotesBySlug(slug, blurb, notes) {
  const { error } = await supabase
    .from("cee_products")
    .update({ blurb, notes })
    .eq("slug", slug);
  if (error) throw new Error(`update ${slug} blurb: ${error.message}`);
  console.log(`  blurb/notes set on '${slug}'`);
}

async function createProduct({
  slug,
  name,
  blurb,
  notes,
  sortOrder,
  imageFilename,
  imageAlt,
  sizes,
}) {
  const { data: existing } = await supabase
    .from("cee_products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    console.log(`  product '${slug}' already exists, skipping create`);
    return;
  }
  const imagePath = imageFilename ? await uploadImage(imageFilename, slug) : null;
  const { data: inserted, error } = await supabase
    .from("cee_products")
    .insert({
      slug,
      name,
      blurb,
      notes,
      sort_order: sortOrder,
      is_active: true,
      image_path: imagePath,
      image_alt: imageAlt ?? null,
    })
    .select("id")
    .single();
  if (error || !inserted) throw new Error(`insert ${slug}: ${error?.message}`);
  if (sizes?.length) {
    const rows = sizes.map((s, i) => ({
      product_id: inserted.id,
      label: s.label,
      price: s.price,
      unit: s.unit ?? null,
      notes: s.notes ?? null,
      sort_order: (i + 1) * 10,
    }));
    const { error: sErr } = await supabase.from("cee_product_sizes").insert(rows);
    if (sErr) throw new Error(`insert sizes for ${slug}: ${sErr.message}`);
  }
  console.log(`  created '${slug}'${imagePath ? " with image" : ""}`);
}

// --- 1) update blurb/notes on existing products ---------------------------
const SANDWICH_FILLINGS =
  "Filling options: Chicken + Mayo + Sundried Tomato; Tuna + Mayo; Ham + Cheese; Egg + Mayo; Mushroom + Hommus; Pumpkin + Salad.";

const HOT_SAVOURY_OPTIONS =
  "Options: Beef Samosa, Veg Samosa (Vegan), Veg Spring Roll, Party Pie, Sausage Roll, Mini Quiche, Honey Soy Wings (GF), Veg Pakora (GF & Vegan), Potato Bhajia (Vegan & GF).";

const existingUpdates = [
  {
    slug: "sandwich-box",
    blurb: "Classic sandwich selection. Up to 3 fillings per Large box.",
    notes: SANDWICH_FILLINGS,
  },
  {
    slug: "sandwich-wrap-boxes",
    blurb: "Mixed gourmet sandwiches and wraps. Maximum of 4 fillings per box.",
    notes: SANDWICH_FILLINGS,
  },
  {
    slug: "hot-savoury-boxes",
    blurb:
      "Warm savoury bites for cooler events. Large: max 3 items. Extra Large: max 4 items. For larger groups, 3 or fewer options recommended for sufficient quantity per item.",
    notes: HOT_SAVOURY_OPTIONS,
  },
  {
    slug: "sweet-box",
    blurb: "A curated sweet platter.",
    notes: "Contents will vary depending on availability.",
  },
  {
    slug: "fruit-sweet-box",
    blurb: "A balance of fresh fruit and sweet treats.",
    notes: "Contents will vary depending on availability.",
  },
  {
    slug: "fairy-bread-box",
    blurb: "A nostalgic favourite for kids' parties.",
    notes: null,
  },
  {
    slug: "grazing-boxes",
    blurb: "A generous spread of cheeses, cured meats, dips and accompaniments.",
    notes: "Contents will vary depending on availability.",
  },
  {
    slug: "fruit-boxes",
    blurb: "Seasonal fruit, sliced and styled.",
    notes: "Contents will vary depending on availability.",
  },
  {
    slug: "banana-bread-scones-box",
    blurb: "Two banana bread loaves with chantilly cream and jam/berry compote.",
    notes: "Extra Large only.",
  },
  {
    slug: "mini-dessert-cups",
    blurb: "Tiramisu, panna cotta, chocolate mousse, trifle.",
    notes:
      "Minimum 30 pieces per flavour. Small $3.50 each, Large $6.50 each.",
  },
];

// --- 2) image assignments for existing products ---------------------------
const existingImages = [
  {
    slug: "sandwich-box",
    file: "Large Sandwich Box.jpeg",
    alt: "Large Sandwich Box with assorted gourmet fillings",
  },
  {
    slug: "sandwich-wrap-boxes",
    file: "Large Sandwich & Wrap Box.jpeg",
    alt: "Large Sandwich and Wrap Box with mixed fillings",
  },
  {
    slug: "sweet-box",
    file: "Large Sweet Box.jpeg",
    alt: "Large Sweet Box with assorted treats",
  },
  {
    slug: "fruit-sweet-box",
    file: "Large Fruit & Sweet Box.jpeg",
    alt: "Large Fruit and Sweet Box",
  },
  {
    slug: "fairy-bread-box",
    file: "Large Fairy Bread Box.jpeg",
    alt: "Large Fairy Bread Box with sprinkle bread triangles",
  },
  {
    slug: "banana-bread-scones-box",
    file: "Scones & Banana Bread Box.jpeg",
    alt: "Scones and banana bread box with cream and jam",
  },
  {
    slug: "mini-dessert-cups",
    file: "Tiramisu.jpeg",
    alt: "Mini tiramisu dessert cup",
  },
];

// --- 3) new products to create -------------------------------------------
const newProducts = [
  {
    slug: "hot-brekkie-box",
    name: "Hot Brekkie Box",
    blurb: "Bacon and egg crumpet with potato gems.",
    notes: "$8 per person. Minimum of 10 portions per order.",
    sortOrder: 25,
    imageFilename: "Hot Brekkie Box.jpeg",
    imageAlt: "Hot Brekkie Box with bacon and egg crumpets and potato gems",
    sizes: [{ label: "Standard", price: 8, unit: "per person" }],
  },
  {
    slug: "cold-brekki-box",
    name: "Cold Brekki Box",
    blurb: "A fresh cold breakfast spread.",
    notes: "$8 per person. Minimum of 10 portions per order.",
    sortOrder: 26,
    imageFilename: "Cold Brekki Box.jpeg",
    imageAlt: "Cold Brekki Box with assorted breakfast items",
    sizes: [{ label: "Standard", price: 8, unit: "per person" }],
  },
  {
    slug: "substantial-sandwiches",
    name: "Substantial Sandwiches",
    blurb: "Hearty sandwiches with salad included with every option.",
    notes:
      "Filling options: Ham, Chicken, Egg, Tuna, Pumpkin. Salad included with every option.",
    sortOrder: 35,
    imageFilename: "Substantial Sandwiches.jpeg",
    imageAlt: "Substantial sandwiches with salad",
    sizes: [{ label: "Standard", price: 9.5, unit: "per person" }],
  },
  {
    slug: "salad-box",
    name: "Salad Box",
    blurb: "Choose from a selection of fresh salads.",
    notes:
      "Options: Mediterranean Pasta Salad (vegan available), Creamy Pasta Salad, Creamy Potato Salad (GF), Garden Salad (Vegan & GF), Coleslaw (GF), Pumpkin Salad (contains lentils & brown rice), Caesar Salad.",
    sortOrder: 45,
    imageFilename: "Salad Box.jpeg",
    imageAlt: "Salad Box with assorted salads",
    sizes: [
      { label: "Large", price: 60 },
      { label: "Extra Large", price: 100 },
    ],
  },
  {
    slug: "individual-banana-bread-loaf",
    name: "Individual Banana Bread Loaf",
    blurb: "Whole banana bread loaf, choose your flavour.",
    notes: null,
    sortOrder: 95,
    imageFilename: "Individual Banana Bread Loaf.jpeg",
    imageAlt: "Individual banana bread loaf",
    sizes: [
      { label: "Original", price: 22 },
      { label: "Biscoff", price: 24 },
      { label: "Oreo", price: 24 },
      { label: "Nutella", price: 24 },
      { label: "Choc Chip", price: 24 },
    ],
  },
];

// --- run ------------------------------------------------------------------
async function main() {
  console.log("1) Updating existing product blurbs/notes...");
  for (const u of existingUpdates) {
    await updateBlurbNotesBySlug(u.slug, u.blurb, u.notes);
  }

  console.log("\n2) Uploading images for existing products...");
  for (const img of existingImages) {
    await setProductImageBySlug(img.slug, img.file, img.alt);
  }

  console.log("\n3) Creating new products...");
  for (const p of newProducts) {
    await createProduct(p);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
