import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  metadataBase: new URL("https://clearnest.vercel.app"),
  title: {
    default: "ClearNest Cleaning Services — A Cleaner Home. A Clearer Mind.",
    template: "%s · ClearNest Cleaning Services",
  },
  description:
    "Professional residential, deep, move-out, and Airbnb cleaning in Salt Lake County. Book online in 60 seconds. Pay after the service is complete.",
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
    url: "https://clearnest.vercel.app",
    siteName: "ClearNest Cleaning Services",
    type: "website",
  },
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
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
