import type { Metadata } from "next";
import Image from "next/image";
import { Ornament } from "@/components/Ornament";
import { GALLERY_MESHES } from "@/lib/theme";
import { getGallery } from "@/lib/content";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A look at our past work — grazing tables, sweet boxes, fruit trays, and custom catering for Darwin events.",
};

export default async function GalleryPage() {
  const images = await getGallery();
  return (
    <>
      <section className="band-blush relative grain-light">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center fade-up relative">
          <span className="text-overline">A taste of our work</span>
          <h1 className="mt-3 font-display heading-lg font-semibold text-[var(--color-wine-deep)]">
            Gallery
          </h1>
          <div className="mt-5">
            <Ornament />
          </div>
          <p className="mt-6 text-[var(--color-ink-soft)] text-lg leading-relaxed">
            A selection of past events and signature boxes.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-20">
        {images.length === 0 ? (
          <PlaceholderGrid />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[160px] md:auto-rows-[200px]">
            {images.map((img) => {
              const span =
                img.shape === "tall" ? "row-span-2" : img.shape === "wide" ? "col-span-2" : "";
              return (
                <figure
                  key={img.id}
                  className={`group relative ${span} overflow-hidden rounded-[1.25rem] border border-[var(--color-line-strong)] grain lift shadow-[var(--shadow-soft)]`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? img.caption ?? "Christine's Exotic Eats catering"}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                  {img.caption ? (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(44,8,16,0.85),transparent)] text-[var(--color-cream-soft)] text-xs px-3 py-2.5 opacity-0 group-hover:opacity-100 transition">
                      {img.caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function PlaceholderGrid() {
  const tiles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    caption: `Past work · ${String(i + 1).padStart(2, "0")}`,
    shape: i % 5 === 0 ? "tall" : i % 4 === 0 ? "wide" : "square",
    mesh: GALLERY_MESHES[i % GALLERY_MESHES.length],
  }));
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[160px] md:auto-rows-[200px]">
        {tiles.map((tile) => {
          const span =
            tile.shape === "tall"
              ? "row-span-2"
              : tile.shape === "wide"
              ? "col-span-2"
              : "";
          return (
            <figure
              key={tile.id}
              className={`group relative ${span} overflow-hidden rounded-[1.25rem] border border-[var(--color-line-strong)] grain lift shadow-[var(--shadow-soft)] ${tile.mesh}`}
            >
              <div className="absolute inset-0 grid place-items-center">
                <span className={`text-overline ${tile.mesh === "mesh-deep-wine" ? "!text-[var(--color-gold-light)]" : "!text-[var(--color-wine-deep)]"}`}>
                  {tile.caption}
                </span>
              </div>
            </figure>
          );
        })}
      </div>
      <p className="mt-14 text-center text-sm text-[var(--color-muted)]">
        Photographs will appear here once Christine uploads them in the admin.
      </p>
    </>
  );
}
