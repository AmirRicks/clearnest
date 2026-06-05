import { createServerClient } from "@/lib/supabase/server-client";
import { format, startOfDay } from "date-fns";

const ALL_SLOTS = ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00"] as const;
type TimeSlot = (typeof ALL_SLOTS)[number];

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

export async function checkAvailability(
  dateStr: string,
): Promise<{ available: boolean; availableSlots: TimeSlot[]; message: string }> {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) {
    return {
      available: false,
      availableSlots: [],
      message: "We're closed on Sundays. Please choose a Monday through Saturday.",
    };
  }

  const todayStart = startOfDay(new Date());
  if (date <= todayStart) {
    return {
      available: false,
      availableSlots: [],
      message: "That date is today or in the past. Please choose a future date.",
    };
  }

  const dayStart = startOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data: bookings } = await getDb()
    .from("bookings")
    .select("scheduled_for")
    .in("status", ["pending", "confirmed", "in_progress", "paid", "invoiced"])
    .gte("scheduled_for", dayStart.toISOString())
    .lt("scheduled_for", dayEnd.toISOString());

  const takenSlots = new Set<string>();
  if (bookings) {
    for (const b of bookings) {
      const h = format(new Date(b.scheduled_for), "HH:mm");
      takenSlots.add(h);
    }
  }

  const availableSlots = ALL_SLOTS.filter((s) => !takenSlots.has(s)) as TimeSlot[];

  if (availableSlots.length === 0) {
    const nextDay = new Date(dayStart);
    const suggestions: string[] = [];
    for (let i = 1; i <= 7; i++) {
      nextDay.setDate(nextDay.getDate() + 1);
      if (nextDay.getDay() === 0) continue;
      const nextDayStr = format(nextDay, "yyyy-MM-dd");
      const { availableSlots: nextSlots } = await checkAvailability(nextDayStr);
      if (nextSlots.length > 0) {
        suggestions.push(format(nextDay, "EEEE, MMMM d"));
        if (suggestions.length >= 3) break;
      }
    }

    return {
      available: false,
      availableSlots: [],
      message: `That date is fully booked.${suggestions.length > 0 ? ` Available dates: ${suggestions.join(", ")}.` : ""}`,
    };
  }

  const timeList = availableSlots
    .map((s) => {
      const h = parseInt(s.split(":")[0]);
      if (h === 0) return "12:00 AM";
      if (h < 12) return `${h}:00 AM`;
      if (h === 12) return "12:00 PM";
      return `${h - 12}:00 PM`;
    })
    .join(", ");

  return {
    available: true,
    availableSlots,
    message: `Available times on ${format(date, "EEEE, MMMM d")}: ${timeList}.`,
  };
}
