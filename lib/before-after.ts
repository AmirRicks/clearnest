/**
 * Before / After gallery manifest.
 *
 * This file is **auto-generated** by `scripts/sync-gallery.mjs`.
 * DO NOT EDIT BY HAND — run the sync script.
 */
import type { LOCATION_SLUGS } from "@/lib/locations";
export type LocationSlug = (typeof LOCATION_SLUGS)[number];
export type Category = "Kitchen" | "Bathroom" | "Bedroom" | "Living" | "Airbnb" | "Other";

export interface BeforeAfterPair {
  id: string;
  label: string;
  category: Category;
  city: LocationSlug | null;
  beforeSrc: string;
  afterSrc: string;
  width: number;
  height: number;
}

export const BEFORE_AFTER_PAIRS: BeforeAfterPair[] = [
  {
    id: "1",
    label: "Cleaning #1",
    category: "Other",
    city: null,
    beforeSrc: "/gallery/1/before.jpg",
    afterSrc: "/gallery/1/after.jpg",
    width: 1004,
    height: 1350,
  },
  {
    id: "2",
    label: "Cleaning #2",
    category: "Other",
    city: null,
    beforeSrc: "/gallery/2/before.jpg",
    afterSrc: "/gallery/2/after.jpg",
    width: 1011,
    height: 1350,
  },
  {
    id: "3",
    label: "Cleaning #3",
    category: "Other",
    city: null,
    beforeSrc: "/gallery/3/before.jpg",
    afterSrc: "/gallery/3/after.jpg",
    width: 1010,
    height: 1350,
  },
];

/** Whether to use the real-photo gallery or fall back to synthetic illustrations. */
export const HAS_REAL_PHOTOS = BEFORE_AFTER_PAIRS.length > 0;
