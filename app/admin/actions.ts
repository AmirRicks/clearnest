"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/supabase/types";
import { createHostedInvoice } from "@/lib/stripe";
import { sendInvoiceEmail, sendReviewRequest } from "@/lib/email";
import { SERVICES } from "@/lib/pricing";
import { BUSINESS } from "@/lib/utils";
import type { LeadStatus } from "@/lib/supabase/types";

type Ok = { ok: true };
type Fail = { ok: false; error: string };

type SB = Awaited<ReturnType<typeof createClient>>;

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

/** Shared: email a booking's customer a review request (Google-first, Yelp fallback). */
async function sendReviewForBooking(
  sb: SB,
  bookingId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: b } = await sb
      .from("bookings")
      .select("customer_name, customer_email")
      .eq("id", bookingId)
      .single();
    if (!b) return { ok: false, error: "Booking not found." };
    if (!b.customer_email) return { ok: false, error: "No customer email on file." };

    const { data: settings } = await sb.from("site_settings").select("key, value");
    const map = Object.fromEntries(
      (settings ?? []).map((r: { key: string; value: string }) => [r.key, r.value])
    );

    const res = await sendReviewRequest({
      to: b.customer_email,
      customerName: b.customer_name,
      yelpUrl: map.yelp_url || BUSINESS.yelpUrl,
      googleUrl: map.google_review_url || undefined,
    });
    return res.ok ? { ok: true } : { ok: false, error: "Email failed (check RESEND_API_KEY)." };
  } catch {
    return { ok: false, error: "Could not send the review request." };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<Ok | Fail> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };
  const { error } = await sb.from("bookings").update({ status }).eq("id", bookingId);
  if (error) return { ok: false, error: error.message };
  // Auto-fire the review request the moment a job is marked complete.
  if (status === "completed") {
    void sendReviewForBooking(sb, bookingId);
  }
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

export async function sendInvoice(
  bookingId: string,
  amount: number
): Promise<Ok | (Fail & { error: string })> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };

  const { data: b, error: fetchErr } = await sb
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();
  if (fetchErr || !b) return { ok: false, error: "Booking not found." };

  const serviceName =
    SERVICES[b.service_id as keyof typeof SERVICES]?.name ?? b.service_id;

  const inv = await createHostedInvoice({
    customerName: b.customer_name,
    customerEmail: b.customer_email,
    amount,
    description: `${serviceName} — ${new Date(b.scheduled_for).toLocaleDateString()} — ${b.address_line1}, ${b.city}`,
    metadata: { bookingId },
  });

  if (!inv.ok) return { ok: false, error: inv.error };

  const { error: updateErr } = await sb
    .from("bookings")
    .update({
      stripe_invoice_id: inv.id,
      stripe_invoice_url: inv.hostedUrl,
      status: "invoiced",
    })
    .eq("id", bookingId);
  if (updateErr) return { ok: false, error: updateErr.message };

  void sendInvoiceEmail({
    to: b.customer_email,
    customerName: b.customer_name,
    hostedUrl: inv.hostedUrl,
    amount,
  });

  revalidatePath("/admin");
  revalidatePath("/account");
  return { ok: true };
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus
): Promise<Ok | Fail> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };
  const { error } = await sb.from("leads").update({ status }).eq("id", leadId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function requestReview(bookingId: string): Promise<Ok | Fail> {
  const { sb, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };
  const res = await sendReviewForBooking(sb, bookingId);
  return res.ok ? { ok: true } : { ok: false, error: res.error || "Could not send." };
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
