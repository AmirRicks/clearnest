"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/supabase/types";

type Ok = { ok: true };
type Fail = { ok: false; error: string };

async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { sb, user: null };
  const { data: admin } = await sb
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return { sb, user, isAdmin: Boolean(admin) };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<Ok | Fail> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };
  const { error } = await sb.from("bookings").update({ status }).eq("id", bookingId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function upsertReview(input: {
  id?: string;
  customer_name: string;
  location: string | null;
  rating: number;
  body: string;
  source: "yelp" | "google" | "direct" | "facebook";
  featured: boolean;
  reviewed_at: string;
}): Promise<Ok | Fail> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };

  const payload = {
    customer_name: input.customer_name,
    location: input.location,
    rating: input.rating,
    body: input.body,
    source: input.source,
    featured: input.featured,
    reviewed_at: input.reviewed_at,
  };

  if (input.id) {
    const { error } = await sb.from("reviews").update(payload).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await sb.from("reviews").insert(payload);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<Ok | Fail> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };
  const { error } = await sb.from("reviews").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  return { ok: true };
}

export async function updateSetting(key: string, value: string): Promise<Ok | Fail> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };
  const { error } = await sb
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}
