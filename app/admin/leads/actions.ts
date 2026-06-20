"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { estimatePrice, SERVICES } from "@/lib/pricing";
import { validatePromo, discountRange } from "@/lib/promo";
import type { BookingLite } from "@/lib/first-clean";
import { sendBookingConfirmation } from "@/lib/email";

export async function updateLeadStatus(id: string, newStatus: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("[Leads] Failed to update status:", error);
    return { ok: false, error: "Failed to update lead status." };
  }

  revalidatePath("/admin/leads");
  return { ok: true };
}

const BookingFromLeadSchema = z.object({
  scheduledFor: z.string().datetime(),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().nullable(),
  city: z.string().min(2),
  zip: z.string().min(4),
  promoCode: z.string().trim().max(40).optional().nullable(),
});

export async function createBookingFromLead(lead: any, bookingDetails: unknown): Promise<{ok: boolean, error?: string, note?: string}> {
  const parsedDetails = BookingFromLeadSchema.safeParse(bookingDetails);
  if (!parsedDetails.success) {
    return { ok: false, error: "Invalid booking details provided." };
  }
  const details = parsedDetails.data;

  const supabase = await createClient();

  // A lead doesn't have beds/baths/sqft, so we use defaults for now.
  // Phase 2 could involve AI estimation or more fields in the modal.
  const serviceId = lead.service_id || 'standard';
  const bedrooms = lead.bedrooms || 2;
  const bathrooms = lead.bathrooms || 2;
  const sqft = lead.sqft || 1500;

  const { low, high } = estimatePrice({ serviceId, bedrooms, bathrooms, sqft, addonIds: [], frequency: 'one_time' });

  // Validate the promo code (FOUNDING20 is new-customers-only — checked against
  // past bookings by email/phone). Apply to the stored estimate; record it.
  let finalLow = low;
  let finalHigh = high;
  let promoCode: string | null = null;
  let promoPct = 0;
  let note: string | undefined;
  if (details.promoCode) {
    const { data: priorBookings } = await supabase
      .from("bookings")
      .select("customer_email, customer_phone, status");
    const v = validatePromo(
      details.promoCode,
      { email: lead.email, phone: lead.phone },
      (priorBookings ?? []) as BookingLite[]
    );
    if (v.ok) {
      promoCode = v.promo.code;
      promoPct = v.promo.percentOff;
      ({ low: finalLow, high: finalHigh } = discountRange(low, high, promoPct));
    } else if (v.reason === "not_first_clean") {
      note = "Promo not applied — this customer has booked before (new-customers-only code).";
    } else if (v.reason === "invalid") {
      note = "Promo not applied — code not recognized.";
    }
  }

  // 1. Create the new booking. Insert with promo columns; if migration 0008
  // hasn't been run yet, fall back so approving a lead never breaks. The
  // discounted estimate lives on the base row, so the discount persists.
  const baseInsert = {
    service_id: serviceId,
    scheduled_for: details.scheduledFor,
    bedrooms,
    bathrooms,
    sqft,
    estimated_low: finalLow,
    estimated_high: finalHigh,
    customer_name: lead.name,
    customer_email: lead.email,
    customer_phone: lead.phone,
    address_line1: details.addressLine1,
    address_line2: details.addressLine2,
    city: details.city,
    zip: details.zip,
    status: 'confirmed', // New bookings from leads are auto-confirmed
  };
  const extendedInsert = { ...baseInsert, promo_code: promoCode, promo_discount_pct: promoPct };

  let booking: { id: string } | null = null;
  {
    let r = await supabase.from("bookings").insert(extendedInsert).select('id').single();
    if (r.error) {
      console.warn("[Leads] booking insert with promo columns failed — falling back (run migration 0008):", r.error.message);
      r = await supabase.from("bookings").insert(baseInsert).select('id').single();
    }
    if (r.error || !r.data) {
      console.error("Failed to create booking from lead", r.error);
      return { ok: false, error: "Database error: Could not create booking." };
    }
    booking = r.data;
  }

  // 2. Update the lead status to 'won'
  await supabase.from("leads").update({ status: 'won' }).eq("id", lead.id);
  
  // 3. Send confirmation email (fire and forget)
  void sendBookingConfirmation({
    to: lead.email,
    customerName: lead.name,
    serviceName: SERVICES[serviceId as keyof typeof SERVICES].name,
    scheduledFor: details.scheduledFor,
    address: `${details.addressLine1}, ${details.city}, UT ${details.zip}`,
    priceLow: finalLow,
    priceHigh: finalHigh,
    bookingId: booking.id,
  });

  // Revalidate paths to update UI
  revalidatePath("/admin/leads");
  revalidatePath("/admin/calendar");

  return { ok: true, note };
}
