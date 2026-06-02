import type { MetadataRoute } from "next";

const BASE = "https://clearnest.services";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "", // home
    "/services",
    "/gallery",
    "/reviews",
    "/about",
    "/faq",
    "/contact",
    "/agreement",
    "/book",
  ];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/book" || path === "/services" ? 0.9 : 0.7,
  }));
}
