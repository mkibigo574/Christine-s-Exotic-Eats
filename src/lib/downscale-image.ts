"use client";

// Downscale a chosen image in the browser before it is uploaded.
//
// Why: admin product photos are POSTed through the Next.js server action (and
// the proxy, which buffers the body). Phone/camera originals are often 5–15MB,
// which can hit body-size limits and fail the upload. Resizing to a sensible
// web maximum keeps payloads small (typically well under 1MB) and uploads fast,
// while staying far sharper than the site ever renders.
//
// The result is written back onto the <input type="file"> via DataTransfer so a
// normal form submission picks up the smaller file with no other changes.

const MAX_DIMENSION = 2400; // longest edge, in px
const QUALITY = 0.9;
// Leave files this small untouched — not worth re-encoding.
const SKIP_BELOW_BYTES = 1_500_000;

export async function downscaleImageInput(
  input: HTMLInputElement,
  file: File,
): Promise<File> {
  const scaled = await downscaleImage(file);
  if (scaled !== file) {
    try {
      const dt = new DataTransfer();
      dt.items.add(scaled);
      input.files = dt.files;
    } catch {
      // Older browsers without DataTransfer support: keep the original file.
      return file;
    }
  }
  return scaled;
}

export async function downscaleImage(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  // GIFs would lose animation; leave them alone.
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // Can't decode (e.g. unsupported format) — upload as-is.
  }

  const { width, height } = bitmap;
  const longest = Math.max(width, height);
  const scale = Math.min(1, MAX_DIMENSION / longest);

  // Already small enough in both dimensions and bytes — don't bother.
  if (scale === 1 && file.size < SKIP_BELOW_BYTES) {
    bitmap.close?.();
    return file;
  }

  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) return file;
  // If re-encoding somehow produced a larger file, keep the smaller original.
  if (blob.size >= file.size && scale === 1) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
