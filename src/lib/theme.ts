export const CATEGORY_MESH: Record<string, string> = {
  "fruit-boxes": "mesh-fruit",
  "grazing-boxes": "mesh-grazing",
  "sandwich-wrap-boxes": "mesh-sandwich",
  "sandwich-boxes": "mesh-sandwich",
  "hot-savoury-boxes": "mesh-savoury",
  "sweet-boxes": "mesh-sweet",
  "fruit-sweet-boxes": "mesh-sweet",
  "fairy-bread-boxes": "mesh-fairy",
  "banana-bread-scones": "mesh-banana",
  "mini-dessert-cups": "mesh-dessert",
};

export function meshFor(slug: string): string {
  return CATEGORY_MESH[slug] ?? "mesh-grazing";
}

export const GALLERY_MESHES = [
  "mesh-grazing",
  "mesh-fruit",
  "mesh-sweet",
  "mesh-savoury",
  "mesh-sandwich",
  "mesh-fairy",
  "mesh-banana",
  "mesh-dessert",
  "mesh-deep-wine",
];
