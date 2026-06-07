"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { estimatePrice, SERVICES } from "@/lib/pricing";
import { sendBookingConfirmation } from "@/lib/email";

async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: admin } = await sb
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return admin ? sb : null;
}

export async function updateLeadStatus(id: string, newStatus: string) {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Not authorized." };

  const statusCheck = z.enum(["new", "contacted", "won", "lost"]).safeParse(newStatus);
  if (!statusCheck.success) return { ok: false, error: "Invalid status." };

  const { error } = await supabase
    .from("leads")
    .update({ status: statusCheck.data })
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
});

const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  service_id: z.string().nullable().optional(),
  bedrooms: z.coerce.number().int().min(0).nullable().optional(),
  bathrooms: z.coerce.number().int().min(0).nullable().optional(),
  sqft: z.coerce.number().int().min(0).nullable().optional(),
});

export async function createBookingFromLead(lead: unknown, bookingDetails: unknown): Promise<{ok: boolean, error?: string}> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: "Not authorized." };

  const parsedLead = LeadSchema.safeParse(lead);
  if (!parsedLead.success) {
    return { ok: false, error: "Invalid lead data." };
  }
  const l = parsedLead.data;

  const parsedDetails = BookingFromLeadSchema.safeParse(bookingDetails);
  if (!parsedDetails.success) {
    return { ok: false, error: "Invalid booking details provided." };
  }
  const details = parsedDetails.data;

  const serviceId = (l.service_id || 'standard') as keyof typeof SERVICES;
  const bedrooms = l.bedrooms ?? 2;
  const bathrooms = l.bathrooms ?? 2;
  const sqft = l.sqft ?? 1500;

  const { low, high } = estimatePrice({ serviceId, bedrooms, bathrooms, sqft, addonIds: [], frequency: 'one_time' });

  // 1. Create the new booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      service_id: serviceId,
      scheduled_for: details.scheduledFor,
      bedrooms,
      bathrooms,
      sqft,
      estimated_low: low,
      estimated_high: high,
      customer_name: l.name,
      customer_email: l.email,
      customer_phone: l.phone,
      address_line1: details.addressLine1,
      address_line2: details.addressLine2,
      city: details.city,
      zip: details.zip,
      status: 'confirmed', // New bookings from leads are auto-confirmed
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    console.error("Failed to create booking from lead", bookingError);
    return { ok: false, error: "Database error: Could not create booking." };
  }

  // 2. Update the lead status to 'won'
  await supabase.from("leads").update({ status: 'won' }).eq("id", l.id);
  
  // 3. Send confirmation email (fire and forget)
  void sendBookingConfirmation({
    to: l.email ?? "",
    customerName: l.name ?? "",
    serviceName: SERVICES[serviceId as keyof typeof SERVICES].name,
    scheduledFor: details.scheduledFor,
    address: `${details.addressLine1}, ${details.city}, UT ${details.zip}`,
    priceLow: low,
    priceHigh: high,
    bookingId: booking.id,
  });

  // Revalidate paths to update UI
  revalidatePath("/admin/leads");
  revalidatePath("/admin/calendar");

  return { ok: true };
}
