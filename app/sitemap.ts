import type { MetadataRoute } from "next";
import { LOCATION_SLUGS } from "@/lib/locations";
import { SERVICE_PAGE_SLUGS } from "@/lib/service-pages";

const BASE = "https://clearnest.services";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "", // home
    "/services",
    "/plans",
    "/gift-cards",
    "/house-cleaning",
    "/gallery",
    "/reviews",
    "/about",
    "/faq",
    "/contact",
    "/agreement",
    "/book",
  ];
  const core: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/book" || path === "/services" || path === "/house-cleaning"
          ? 0.9
          : 0.7,
  }));

  // Per-city local landing pages.
  const cities: MetadataRoute.Sitemap = LOCATION_SLUGS.map((slug) => ({
    url: `${BASE}/house-cleaning/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Per-service landing pages.
  const servicePages: MetadataRoute.Sitemap = SERVICE_PAGE_SLUGS.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...core, ...servicePages, ...cities];
}
