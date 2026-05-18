// Uploads the deluxe brekkie photo to Supabase storage + attaches it to the product.
// Usage:  node scripts/set-deluxe-image.mjs <filename-in-Images-folder>
//   e.g.  node scripts/set-deluxe-image.mjs hot-brekkie-deluxe.jpg
import { readFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const filename = process.argv[2];
if (!filename) {
  console.error("Usage: node scripts/set-deluxe-image.mjs <filename-in-Images-folder>");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const env = (() => {
  const out = {};
  const text = readFileSync(join(PROJECT_ROOT, ".env.local"), "utf8");
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

const filePath = join(PROJECT_ROOT, "Images", filename);
statSync(filePath); // throws if missing
const buffer = readFileSync(filePath);
const ext = filename.split(".").pop().toLowerCase();
const contentType =
  ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
const storagePath = `products/${Date.now()}-hot-brekkie-box-deluxe.${ext}`;

const { error: uploadErr } = await supabase.storage
  .from("cee-gallery")
  .upload(storagePath, buffer, { contentType, upsert: false });
if (uploadErr) throw new Error(`upload: ${uploadErr.message}`);

const { error: updateErr } = await supabase
  .from("cee_products")
  .update({
    image_path: storagePath,
    image_alt:
      "Hot Brekkie Box — Deluxe with bacon, sausages, eggs, tomatoes, mushrooms, potato gems and English muffins",
  })
  .eq("slug", "hot-brekkie-box-deluxe");
if (updateErr) throw new Error(`update product: ${updateErr.message}`);

console.log(`✓ Uploaded ${filename} and attached to 'Hot Brekkie Box — Deluxe'`);
console.log(`  storage path: ${storagePath}`);
