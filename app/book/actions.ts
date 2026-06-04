"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { AGREEMENT_VERSION } from "@/lib/agreement";
import { estimatePrice, SERVICES, type ServiceId } from "@/lib/pricing";
import { sendBookingConfirmation } from "@/lib/email";

const bookingSchema = z.object({
  serviceId: z.enum(["standard", "deep", "moveinout", "airbnb"]),
  scheduledFor: z.string().min(1),
  bedrooms: z.coerce.number().int().min(0).max(8),
  bathrooms: z.coerce.number().int().min(0).max(8),
  sqft: z.coerce.number().int().min(200).max(12000),
  frequency: z.enum(["one_time", "monthly", "biweekly", "weekly"]).default("one_time"),
  addons: z
    .array(z.enum(["fridge", "oven", "windows", "cabinets", "laundry", "garage"]))
    .max(12)
    .default([]),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7).max(40),
  addressLine1: z.string().min(3).max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(2).max(120),
  state: z.string().min(2).max(4).default("UT"),
  zip: z.string().min(4).max(12),
  accessNotes: z.string().max(800).optional().nullable(),
  pets: z.string().max(200).optional().nullable(),
  specialRequests: z.string().max(800).optional().nullable(),
  giftCode: z.string().trim().max(40).optional().nullable(),
  signatureDataUrl: z.string().startsWith("data:image/").max(2_000_000),
});

export type BookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error: string };

export async function submitBooking(input: unknown): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please double-check the form — some fields are invalid." };
  }
  const data = parsed.data;

  const { low, high, discountPct, addonsTotal: addonsSum } = estimatePrice({
    serviceId: data.serviceId as ServiceId,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    sqft: data.sqft,
    addonIds: data.addons,
    frequency: data.frequency,
  });

  if (!isSupabaseConfigured()) {
    // Pre-launch / no DB yet: still succeed so the UX can be exercised, but tell the operator.
    console.warn(
      "[ClearNest] Supabase is not configured — booking received but not persisted.",
      { service: SERVICES[data.serviceId as ServiceId].name, customer: data.customerEmail }
    );
    return { ok: true, bookingId: "demo-" + Math.random().toString(36).slice(2, 10) };
  }

  try {
    const sb = await createClient();

    const { data: agreement, error: agreementError } = await sb
      .from("agreements")
      .insert({
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        signature_data_url: data.signatureDataUrl,
        terms_version: AGREEMENT_VERSION,
      })
      .select("id")
      .single();
    if (agreementError) throw agreementError;

    const baseRow = {
      service_id: data.serviceId,
      scheduled_for: data.scheduledFor,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqft: data.sqft,
      estimated_low: low,
      estimated_high: high,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      address_line1: data.addressLine1,
      address_line2: data.addressLine2 ?? null,
      city: data.city,
      state: data.state,
      zip: data.zip,
      access_notes: data.accessNotes ?? null,
      pets: data.pets ?? null,
      special_requests: data.specialRequests ?? null,
      agreement_id: agreement.id,
    };
    const extendedRow = {
      ...baseRow,
      frequency: data.frequency,
      addons: data.addons,
      addons_total: addonsSum,
      discount_pct: discountPct,
      gift_code: data.giftCode ? data.giftCode.toUpperCase() : null,
    };

    // Insert with the revenue columns; if the 0004 migration hasn't been run
    // yet (missing columns), fall back to the base row so bookings never break.
    let booking: { id: string } | null = null;
    {
      const first = await sb.from("bookings").insert(extendedRow).select("id").single();
      if (first.error) {
        console.warn(
          "[ClearNest] booking insert with revenue columns failed — falling back (run migration 0004):",
          first.error.message
        );
        const fallback = await sb.from("bookings").insert(baseRow).select("id").single();
        if (fallback.error) throw fallback.error;
        booking = fallback.data;
      } else {
        booking = first.data;
      }
    }
    if (!booking) throw new Error("Booking was not created.");

    await sb.from("agreements").update({ booking_id: booking.id }).eq("id", agreement.id);

    // Insert a lead so it shows in the admin leads panel
    await sb.from("leads").insert({
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      source: "booking_wizard",
      service_id: data.serviceId,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      sqft: data.sqft,
      estimated_low: low,
      estimated_high: high,
      message: data.specialRequests || null,
    }).select("id").single().then(({ error: leadErr }) => {
      if (leadErr) console.warn("[ClearNest] lead insert failed (non-fatal):", leadErr.message);
    });

    // Fire-and-forget confirmation email (graceful if RESEND_API_KEY missing)
    void sendBookingConfirmation({
      to: data.customerEmail,
      customerName: data.customerName,
      serviceName: SERVICES[data.serviceId as ServiceId].name,
      scheduledFor: data.scheduledFor,
      address: `${data.addressLine1}${data.addressLine2 ? `, ${data.addressLine2}` : ""}, ${data.city}, ${data.state} ${data.zip}`,
      priceLow: low,
      priceHigh: high,
      bookingId: booking.id,
    });

    revalidatePath("/admin");
    return { ok: true, bookingId: booking.id };
  } catch (err) {
    console.error("[ClearNest] booking insert failed", err);
    return {
      ok: false,
      error: "We couldn’t save your booking. Please call (801) 441-0726 and we’ll handle it.",
    };
  }
}
