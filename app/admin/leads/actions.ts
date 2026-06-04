"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { estimatePrice, SERVICES } from "@/lib/pricing";
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
});

export async function createBookingFromLead(lead: any, bookingDetails: unknown): Promise<{ok: boolean, error?: string}> {
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
      customer_name: lead.name,
      customer_email: lead.email,
      customer_phone: lead.phone,
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
  await supabase.from("leads").update({ status: 'won' }).eq("id", lead.id);
  
  // 3. Send confirmation email (fire and forget)
  void sendBookingConfirmation({
    to: lead.email,
    customerName: lead.name,
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
