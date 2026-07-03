import type { NextConfig } from "next";
import path from "node:path";

// Content-Security-Policy. Shipped Report-Only first (per the security
// doctrine — never blind-enforce a fresh CSP on a live site): browsers report
// violations without blocking, so we can watch for a clean run, then flip the
// header key to "Content-Security-Policy" to enforce.
// Origins allowed for current browser usage:
//   - Vercel Analytics  → va.vercel-scripts.com (script) + same-origin beacon
//   - Microsoft Clarity → *.clarity.ms + c.bing.com (only if NEXT_PUBLIC_CLARITY_ID set)
//   - Supabase auth     → *.supabase.co (browser client on /account, /admin/login)
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://www.clarity.ms https://c.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://*.clarity.ms https://c.bing.com",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // Drop the "X-Powered-By: Next.js" response header — a free framework/version
  // fingerprint that helps nobody but an attacker.
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // AVIF first (≈20-30% smaller than WebP) then WebP fallback — shrinks the
    // full-bleed hero photos, the page's LCP element. Cache optimized images a year.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
