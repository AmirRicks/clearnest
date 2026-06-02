import type { MetadataRoute } from "next";

const BASE = "https://clearnest.services";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep the admin + customer-account areas out of search results.
        disallow: ["/admin", "/account", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
