import { createServerClient } from "@/lib/supabase/server-client";
import { createAdminClient } from "@/lib/supabase/admin";
import { format } from "date-fns";
import {
  ACTIVE_BOOKING_STATUSES,
  computeDayAvailability,
  denverDateStr,
  denverTimeStr,
  isOpenDay,
  nextDateStr,
  slotLabel,
  type TimeSlot,
} from "@/lib/availability";
import {
  estimatePrice,
  SERVICES,
  ADDONS,
  FREQUENCIES,
  type ServiceId,
  type AddonId,
  type FrequencyId,
} from "@/lib/pricing";

type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

let _db: ReturnType<typeof createServerClient> | null = null;
function getDb() {
  if (!_db) _db = createServerClient();
  return _db;
}

// ----- CONVERSATION -----

export async function createConversation(sessionId: string) {
  const { data, error } = await getDb()
    .from("ai_conversations")
    .insert({ session_id: sessionId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: Record<string, unknown>,
) {
  await getDb().from("ai_messages").insert({
    conversation_id: conversationId,
    role,
    content,
    metadata: metadata || {},
  });
}

export async function updateConversation(
  conversationId: string,
  updates: {
    user_name?: string;
    user_email?: string;
    user_phone?: string;
    category?: string;
    summary?: string;
    resolved?: boolean;
  },
) {
  await getDb()
    .from("ai_conversations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);
}

export async function incrementMessageCount(conversationId: string) {
  const { data: conv } = await getDb()
    .from("ai_conversations")
    .select("message_count")
    .eq("id", conversationId)
    .single();
  await getDb()
    .from("ai_conversations")
    .update({
      message_count: (conv?.message_count || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);
}

// ----- LEAD -----

export async function createLeadFromAI(input: {
  name: string;
  email: string;
  phone: string;
  serviceId?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  message?: string;
  conversationId?: string;
}): Promise<Result<{ id: string }>> {
  const { data, error } = await getDb()
    .from("leads")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      source: "ai_receptionist",
      service_id: input.serviceId || null,
      bedrooms: input.bedrooms || null,
      bathrooms: input.bathrooms || null,
      sqft: input.sqft || null,
      message: input.message || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ----- BOOKING REQUEST -----

export async function createBookingRequest(input: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  cleaningType?: string;
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  conversationId?: string;
}): Promise<Result<{ id: string }>> {
  const { data, error } = await getDb()
    .from("booking_requests")
    .insert({
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      address: input.address || null,
      bedrooms: input.bedrooms || null,
      bathrooms: input.bathrooms || null,
      property_type: input.propertyType || null,
      cleaning_type: input.cleaningType || null,
      preferred_date: input.preferredDate || null,
      preferred_time: input.preferredTime || null,
      notes: input.notes || null,
      conversation_id: input.conversationId || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ----- SUPPORT TICKET -----

export async function createSupportTicket(input: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  issueType: string;
  priority: "low" | "medium" | "high";
  description: string;
  conversationId?: string;
}): Promise<Result<{ id: string }>> {
  const { data, error } = await getDb()
    .from("support_tickets")
    .insert({
      customer_name: input.customerName || null,
      customer_email: input.customerEmail || null,
      customer_phone: input.customerPhone || null,
      issue_type: input.issueType,
      priority: input.priority,
      description: input.description,
      conversation_id: input.conversationId || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ----- REFUND REQUEST -----

export async function createRefundRequest(input: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceDate?: string;
  address?: string;
  reason: string;
  conversationId?: string;
}): Promise<Result<{ id: string }>> {
  const { data, error } = await getDb()
    .from("refund_requests")
    .insert({
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone || null,
      service_date: input.serviceDate || null,
      address: input.address || null,
      reason: input.reason,
      conversation_id: input.conversationId || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

// ----- AVAILABILITY CHECK -----
// Uses the SAME shared module as the customer calendar (lib/availability) so the
// AI and the calendar can never disagree. Denver timezone, Tue–Sat, fail-open.

/** "Tuesday, June 16" for a YYYY-MM-DD date (rendered at local noon to avoid tz drift). */
function labelDate(ds: string): string {
  return format(new Date(`${ds}T12:00:00`), "EEEE, MMMM d");
}

/** ISO instant at UTC midnight of (ds + offsetDays) — a safe query bound. */
function utcShift(ds: string, offsetDays: number): string {
  const [y, m, d] = ds.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + offsetDays);
  return dt.toISOString();
}

export async function checkAvailability(
  dateStr: string,
): Promise<{ available: boolean; availableSlots: TimeSlot[]; message: string }> {
  // Normalize to a Denver YYYY-MM-DD (accept ISO date or anything Date can parse).
  let ds = (dateStr || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ds)) {
    const d = new Date(ds);
    if (isNaN(d.getTime())) {
      return {
        available: false,
        availableSlots: [],
        message: "I couldn't read that date — could you give it as a weekday and date, like 'Tuesday, June 16'?",
      };
    }
    ds = denverDateStr(d);
  }

  const today = denverDateStr();
  if (ds <= today) {
    return {
      available: false,
      availableSlots: [],
      message:
        ds < today
          ? "That date has already passed — please pick an upcoming day."
          : "We need 24 hours' notice, so today isn't bookable. The earliest is tomorrow — want me to check it?",
    };
  }
  if (!isOpenDay(ds)) {
    return {
      available: false,
      availableSlots: [],
      message: "We're closed Sundays and Mondays — we clean Tuesday through Saturday. Want me to find the next open day?",
    };
  }

  // Read booked slots for the day. Service-role client (no RLS dependency); on
  // any failure we fail open and treat the day as fully available.
  let bookedSlots: string[] = [];
  try {
    const db = createAdminClient() ?? getDb();
    const { data } = await db
      .from("bookings")
      .select("scheduled_for, status")
      .in("status", ACTIVE_BOOKING_STATUSES as unknown as string[])
      .gte("scheduled_for", utcShift(ds, -1))
      .lt("scheduled_for", utcShift(ds, 2));
    bookedSlots = (data ?? [])
      .filter((r) => denverDateStr(new Date(r.scheduled_for)) === ds)
      .map((r) => denverTimeStr(new Date(r.scheduled_for)));
  } catch {
    // fail open
  }

  const day = computeDayAvailability(ds, bookedSlots, today);

  if (day.availableSlots.length === 0) {
    const suggestions: string[] = [];
    let probe = ds;
    for (let i = 0; i < 10 && suggestions.length < 3; i++) {
      probe = nextDateStr(probe);
      if (isOpenDay(probe)) suggestions.push(labelDate(probe));
    }
    return {
      available: false,
      availableSlots: [],
      message: `${labelDate(ds)} is fully booked.${suggestions.length ? ` The next open days are ${suggestions.join(", ")}.` : ""}`,
    };
  }

  const timeList = day.availableSlots.map(slotLabel).join(", ");
  return {
    available: true,
    availableSlots: day.availableSlots,
    message: `${labelDate(ds)} has these times open: ${timeList}.`,
  };
}

// ----- PRICE ESTIMATE -----
// Deterministic quote from the SAME formula the website's booking estimator
// uses (lib/pricing.estimatePrice), so the AI and the site can never disagree.
// The AI knowledge base only lists base rates; without this tool the model
// hallucinated totals ~half the real price for multi-bedroom homes.

const VALID_SERVICE_IDS = Object.keys(SERVICES) as ServiceId[];
const VALID_FREQUENCIES = Object.keys(FREQUENCIES) as FrequencyId[];

/** Typical Salt Lake County home size by bedroom count, used when the customer
 *  hasn't told us their square footage yet (so a quote is still possible). */
function typicalSqft(bedrooms: number): number {
  const map: Record<number, number> = { 0: 600, 1: 750, 2: 1100, 3: 1700, 4: 2300, 5: 2900, 6: 3500 };
  return map[Math.max(0, Math.min(6, Math.round(bedrooms)))] ?? 1700;
}

export type QuoteResult = {
  ok: true;
  service: string;
  serviceId: ServiceId;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  approximate: boolean;
  low: number;
  high: number;
  mid: number;
  discountPct: number;
  message: string;
};

/** Compute an exact price range for a home. Fills sensible defaults for any
 *  missing input so a partial question ("how much for a 3-bedroom?") still
 *  yields a real number, and flags the result as approximate when it did. */
export function estimateQuoteForAI(input: {
  serviceId?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  addonIds?: string[];
  frequency?: string;
}): QuoteResult {
  const serviceId: ServiceId = VALID_SERVICE_IDS.includes(input.serviceId as ServiceId)
    ? (input.serviceId as ServiceId)
    : "standard";

  const bedrooms = Number.isFinite(input.bedrooms)
    ? Math.max(0, Math.min(8, Math.round(input.bedrooms as number)))
    : 3;
  const bathroomsAssumed = !Number.isFinite(input.bathrooms);
  const bathrooms = bathroomsAssumed
    ? Math.max(1, bedrooms - 1)
    : Math.max(0, Math.min(8, Math.round(input.bathrooms as number)));
  const sqftAssumed = !Number.isFinite(input.sqft);
  const sqft = sqftAssumed ? typicalSqft(bedrooms) : (input.sqft as number);

  const addonIds = (input.addonIds ?? []).filter((id): id is AddonId => id in ADDONS);
  const frequency: FrequencyId = VALID_FREQUENCIES.includes(input.frequency as FrequencyId)
    ? (input.frequency as FrequencyId)
    : "one_time";

  const est = estimatePrice({ serviceId, bedrooms, bathrooms, sqft, addonIds, frequency });
  const approximate = bathroomsAssumed || sqftAssumed;

  const sizeStr = `${bedrooms} bed / ${bathrooms} bath${sqftAssumed ? "" : `, ~${sqft.toLocaleString()} sqft`}`;
  const discountNote = est.discountPct > 0 ? ` (after ${est.discountPct}% recurring discount)` : "";
  const approxNote = approximate
    ? ` Approximate — based on a typical ${bedrooms}-bedroom home; confirm bathrooms and square footage to tighten it.`
    : "";
  const message =
    `${SERVICES[serviceId].name} for a ${sizeStr} home: $${est.low}–$${est.high}${discountNote}. ` +
    `Final price is confirmed at booking from the home's actual size.${approxNote}`;

  return {
    ok: true,
    service: SERVICES[serviceId].name,
    serviceId,
    bedrooms,
    bathrooms,
    sqft,
    approximate,
    low: est.low,
    high: est.high,
    mid: est.mid,
    discountPct: est.discountPct,
    message,
  };
}
