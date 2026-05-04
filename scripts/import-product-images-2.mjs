// Second batch — uploads images for products that were previously imageless.
// Run from project root:   node scripts/import-product-images-2.mjs

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

async function setImage(slug, file, alt) {
  const filePath = join(IMAGES_DIR, file);
  statSync(filePath);
  const buffer = readFileSync(filePath);
  const ext = file.split(".").pop().toLowerCase();
  const storagePath = `products/${Date.now()}-${slug}.${ext}`;
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: ext === "png" ? "image/png" : "image/jpeg",
    upsert: false,
  });
  if (upErr) throw new Error(`upload ${file}: ${upErr.message}`);
  const { error } = await supabase
    .from("cee_products")
    .update({ image_path: storagePath, image_alt: alt })
    .eq("slug", slug);
  if (error) throw new Error(`update ${slug}: ${error.message}`);
  console.log(`  '${slug}' → ${storagePath}`);
}

const assignments = [
  { slug: "fruit-boxes", file: "Large Fruit Box.jpeg", alt: "Large Fruit Box with sliced seasonal fruit" },
  { slug: "grazing-boxes", file: "Large Grazing Box.jpeg", alt: "Large Grazing Box with cheeses, cured meats and dips" },
  { slug: "hot-savoury-boxes", file: "Large Savoury Box.jpeg", alt: "Large Savoury Box with samosas, spring rolls and party pies" },
];

for (const a of assignments) {
  await setImage(a.slug, a.file, a.alt);
}
console.log("Done.");
