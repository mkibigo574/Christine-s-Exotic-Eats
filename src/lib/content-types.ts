export type Size = {
  id?: string;
  label: string;
  price: number;
  unit?: string | null;
  serves?: string | null;
  notes?: string | null;
  sort_order?: number;
};

export type Category = {
  id?: string;
  slug: string;
  name: string;
  blurb: string;
  notes?: string | null;
  sizes: Size[];
  is_active?: boolean;
  sort_order?: number;
  image_path?: string | null;
  image_alt?: string | null;
  image_url?: string | null;
};

export type Review = {
  id?: string;
  quote: string;
  author: string;
  context?: string | null;
  source?: "Facebook" | "Google" | "Direct" | null;
  is_published?: boolean;
  sort_order?: number;
};

export type GalleryImage = {
  id: string;
  storage_path: string;
  url: string;
  caption?: string | null;
  alt?: string | null;
  shape: "square" | "tall" | "wide";
  sort_order: number;
  is_published: boolean;
};

export const FEEDING_ESTIMATES: Record<string, string> = {
  Small: "Serves 2–4",
  Large: "Serves 8–10",
  "Extra Large": "Serves 15–18 (up to 20)",
};

export const DELIVERY = [
  { zone: "Palmerston", fee: 10 },
  { zone: "Darwin City & Northern Suburbs", fee: 20 },
  { zone: "Pick-up from Zuccoli", fee: 0 },
];

export const GALLERY_BUCKET = "cee-gallery";

export function formatPrice(p: number) {
  return p % 1 === 0 ? `$${p}` : `$${p.toFixed(2)}`;
}
