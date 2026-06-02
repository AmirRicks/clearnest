"use server";

import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { sendLeadNotification, sendLeadAutoReply } from "@/lib/email";

const leadSchema = z.object({
  name: z.string().max(120).optional().nullable(),
  email: z.string().email().max(200).optional().or(z.literal("")).nullable(),
  phone: z.string().max(40).optional().or(z.literal("")).nullable(),
  source: z.string().max(40).default("website"),
  service_id: z.string().max(40).optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).max(12).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).max(12).optional().nullable(),
  sqft: z.coerce.number().int().min(0).max(20000).optional().nullable(),
  estimated_low: z.coerce.number().int().optional().nullable(),
  estimated_high: z.coerce.number().int().optional().nullable(),
  message: z.string().max(1000).optional().nullable(),
});

export type LeadResult = { ok: true } | { ok: false; error: string };

export async function submitLead(input: unknown): Promise<LeadResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please add a name and a phone or email." };
  const d = parsed.data;

  // Need at least one way to contact them.
  if (!d.phone && !d.email) {
    return { ok: false, error: "Please add a phone number or email so we can reach you." };
  }

  if (!isSupabaseConfigured()) {
    console.info("[ClearNest lead]", d);
    void sendLeadNotification(d);
    if (d.email) void sendLeadAutoReply({ to: d.email, customerName: d.name });
    return { ok: true };
  }

  try {
    const sb = await createClient();
    const { error } = await sb.from("leads").insert({
      name: d.name || null,
      email: d.email || null,
      phone: d.phone || null,
      source: d.source || "website",
      service_id: d.service_id || null,
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      sqft: d.sqft ?? null,
      estimated_low: d.estimated_low ?? null,
      estimated_high: d.estimated_high ?? null,
      message: d.message || null,
    });
    if (error) throw error;
    void sendLeadNotification(d);
    // Speed-to-lead: instantly acknowledge the customer.
    if (d.email) void sendLeadAutoReply({ to: d.email, customerName: d.name });
    return { ok: true };
  } catch (err) {
    console.error("[ClearNest lead] insert failed", err);
    return { ok: false, error: "Couldn’t send that — please call (801) 441-0726." };
  }
}
