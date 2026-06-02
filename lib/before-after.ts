/**
 * Before / After gallery manifest.
 *
 * This file is **auto-generated** by `scripts/sync-gallery.mjs` from photos
 * the owner drops into `~/Documents/ClearNest/Before-After/{N}/before.* + after.*`.
 *
 * To regenerate: `npm run sync-gallery`
 *
 * When `BEFORE_AFTER_PAIRS` is empty, the gallery falls back to the
 * synthetic illustrated rooms in `<BeforeAfter />` — keeps the site
 * looking complete before the owner has any real photos.
 *
 * DO NOT EDIT BY HAND — run the sync script.
 */

export type Category = "Kitchen" | "Bathroom" | "Bedroom" | "Living" | "Airbnb" | "Other";

export interface BeforeAfterPair {
  /** Stable id (the numbered folder, e.g. "1") */
  id: string;
  label: string;
  category: Category;
  /** Path under /public — e.g. /gallery/1/before.jpg */
  beforeSrc: string;
  afterSrc: string;
  /** Image dimensions for layout-shift-free rendering + true aspect ratio. */
  width: number;
  height: number;
}

/** Auto-generated list. Empty until the owner runs `npm run sync-gallery`. */
export const BEFORE_AFTER_PAIRS: BeforeAfterPair[] = [
  {
    id: "1",
    label: "Bathroom — toilet deep clean",
    category: "Bathroom",
    beforeSrc: "/gallery/1/before.jpg",
    afterSrc: "/gallery/1/after.jpg",
    width: 1004,
    height: 1350,
  },
  {
    id: "2",
    label: "Master bedroom — deep clean",
    category: "Bedroom",
    beforeSrc: "/gallery/2/before.jpg",
    afterSrc: "/gallery/2/after.jpg",
    width: 1011,
    height: 1350,
  },
  {
    id: "3",
    label: "Bedroom — clutter reset & vacuum",
    category: "Bedroom",
    beforeSrc: "/gallery/3/before.jpg",
    afterSrc: "/gallery/3/after.jpg",
    width: 1010,
    height: 1350,
  },
];

/** Whether to use the real-photo gallery or fall back to synthetic illustrations. */
export const HAS_REAL_PHOTOS = BEFORE_AFTER_PAIRS.length > 0;

/** Display label fallback for a numbered folder when meta.json is absent. */
export function fallbackLabel(id: string): string {
  return `Cleaning #${id}`;
}
