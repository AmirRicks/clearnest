import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BUSINESS = {
  name: "ClearNest Cleaning Services",
  short: "ClearNest",
  tagline: "A Cleaner Home. A Clearer Mind.",
  phone: "(801) 441-0726",
  phoneHref: "tel:+18014410726",
  smsHref: "sms:+18014410726",
  email: "clearnest.services@gmail.com",
  emailHref: "mailto:clearnest.services@gmail.com",
  serviceArea: "Salt Lake City and within 40 miles, Utah",
  hours: "Tue–Sat · 7:00 AM – 7:00 PM",
  yelpUrl: process.env.NEXT_PUBLIC_YELP_URL ?? "https://www.yelp.com/biz/clearnest-cleaning-services",
  gbpUrl: process.env.NEXT_PUBLIC_GBP_URL ?? "",
} as const;

export function formatCurrencyRange(low: number, high: number) {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  return `${fmt.format(low)} – ${fmt.format(high)}`;
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}
