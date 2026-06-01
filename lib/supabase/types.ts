export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "invoiced"
  | "paid"
  | "canceled";

export interface Booking {
  id: string;
  created_at: string;
  service_id: string;
  scheduled_for: string; // ISO
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  estimated_low: number;
  estimated_high: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  access_notes: string | null;
  pets: string | null;
  special_requests: string | null;
  status: BookingStatus;
  agreement_id: string | null;
  reschedule_count: number;
  // Phase 2 (migration 0002) — optional until DB is migrated
  stripe_invoice_id?: string | null;
  stripe_invoice_url?: string | null;
  last_reschedule_at?: string | null;
  last_status_change?: string | null;
}

export interface Agreement {
  id: string;
  created_at: string;
  booking_id: string | null;
  customer_name: string;
  customer_email: string;
  signature_data_url: string; // base64 PNG
  terms_version: string;
  signed_at: string;
  ip_hash: string | null;
}

export interface Review {
  id: string;
  created_at: string;
  customer_name: string;
  location: string | null;
  rating: number; // 1-5
  body: string;
  source: "yelp" | "google" | "direct" | "facebook";
  featured: boolean;
  reviewed_at: string;
}
