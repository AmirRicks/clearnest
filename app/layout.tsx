import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { LocalBusinessJsonLd } from "@/components/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clearnest.services"),
  title: {
    default: "ClearNest Cleaning Services — A Cleaner Home. A Clearer Mind.",
    template: "%s · ClearNest Cleaning Services",
  },
  description:
    "Professional residential, deep, move-out, and Airbnb cleaning within 40 miles of Salt Lake City, Utah. Book online in 60 seconds. Pay after the service is complete.",
  keywords: [
    "house cleaning",
    "deep cleaning",
    "Airbnb turnover",
    "move-out cleaning",
    "Salt Lake City cleaning service",
    "Utah cleaners",
    "ClearNest",
  ],
  openGraph: {
    title: "ClearNest Cleaning Services",
    description:
      "Premium cleaning that feels effortless. Book online, pay after the clean.",
    url: "https://clearnest.services",
    siteName: "ClearNest Cleaning Services",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/video/home-tour-poster.jpg",
        width: 1920,
        height: 1080,
        alt: "ClearNest Cleaning Services — a freshly cleaned modern home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearNest Cleaning Services",
    description: "Premium cleaning in Salt Lake City. Book online, pay after the clean.",
    images: ["/video/home-tour-poster.jpg"],
  },
  alternates: { canonical: "https://clearnest.services" },
};

export const viewport: Viewport = {
  themeColor: "#fdfdfb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased">
        <LocalBusinessJsonLd />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
