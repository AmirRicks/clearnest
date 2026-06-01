"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SERVICES } from "@/lib/pricing";
import { sendRescheduleConfirmation, sendCancelConfirmation } from "@/lib/email";

type Ok = { ok: true };
type Fail = { ok: false; error: string };

const MIN_RESCHEDULE_LEAD_HOURS = 24;

async function getOwnedBooking(bookingId: string) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) return { sb, user: null, booking: null };

  const { data: admin } = await sb
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const isAdmin = Boolean(admin);

  const { data: booking } = await sb
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) return { sb, user, booking: null };
  const owns = booking.customer_email.toLowerCase() === user.email.toLowerCase();
  if (!owns && !isAdmin) return { sb, user, booking: null };
  return { sb, user, booking, isAdmin };
}

export async function rescheduleBooking(
  bookingId: string,
  newIso: string
): Promise<Ok | Fail> {
  const { sb, booking, isAdmin } = await getOwnedBooking(bookingId);
  if (!sb || !booking) return { ok: false, error: "Booking not found or not yours." };

  const newDate = new Date(newIso);
  if (isNaN(newDate.getTime())) return { ok: false, error: "Invalid new date." };

  const hoursAway = (new Date(booking.scheduled_for).getTime() - Date.now()) / 3_600_000;
  if (!isAdmin && hoursAway < MIN_RESCHEDULE_LEAD_HOURS) {
    return {
      ok: false,
      error: "Too close to start — please call (801) 441-0726 for same-day reschedules.",
    };
  }
  if (booking.status === "completed" || booking.status === "paid" || booking.status === "canceled") {
    return { ok: false, error: "This booking can’t be rescheduled." };
  }

  const oldFor = booking.scheduled_for;
  const { error } = await sb
    .from("bookings")
    .update({
      scheduled_for: newDate.toISOString(),
      reschedule_count: (booking.reschedule_count ?? 0) + 1,
      last_reschedule_at: new Date().toISOString(),
      status: booking.status === "confirmed" ? "confirmed" : "pending",
    })
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  void sendRescheduleConfirmation({
    to: booking.customer_email,
    customerName: booking.customer_name,
    oldFor,
    newFor: newDate.toISOString(),
    bookingId,
  });

  revalidatePath("/account");
  revalidatePath("/admin");
  return { ok: true };
}

export async function cancelBooking(bookingId: string): Promise<Ok | Fail> {
  const { sb, booking, isAdmin } = await getOwnedBooking(bookingId);
  if (!sb || !booking) return { ok: false, error: "Booking not found or not yours." };

  if (booking.status === "completed" || booking.status === "paid" || booking.status === "canceled") {
    return { ok: false, error: "This booking can’t be canceled." };
  }

  const hoursAway = (new Date(booking.scheduled_for).getTime() - Date.now()) / 3_600_000;
  // We could enforce a 24h policy or just record + let admin waive the fee.
  // For now, allow cancel any time; the 25% fee is enforced manually by admin.

  const { error } = await sb
    .from("bookings")
    .update({ status: "canceled" })
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  void sendCancelConfirmation({
    to: booking.customer_email,
    customerName: booking.customer_name,
    bookingId,
  });

  revalidatePath("/account");
  revalidatePath("/admin");
  void isAdmin; // silence linter
  void SERVICES; // keep import tree small later
  void hoursAway;
  return { ok: true };
}
