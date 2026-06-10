"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  ACTIVE_BOOKING_STATUSES,
  buildAvailabilityRange,
  bucketBookings,
  denverDateStr,
  type DayAvailability,
} from "@/lib/availability";

/**
 * Availability for the inclusive date range the calendar is rendering.
 * `startStr`/`endStr` are YYYY-MM-DD (the grid's first and last visible cells),
 * so the returned map covers EXACTLY what the UI shows — no holes.
 *
 * Reads bookings with the service-role client (bypasses RLS — works whether or
 * not the public-select policy is applied), and FAILS OPEN on any problem: a
 * missing DB, a query error, or an empty result all yield free future open
 * days rather than a calendar full of false "unavailable" dates.
 */
export async function getAvailability(
  startStr: string,
  endStr: string,
): Promise<DayAvailability[]> {
  const todayStr = denverDateStr();

  // Validate inputs; fall back to a sane 60-day window if the client sent junk.
  const start = /^\d{4}-\d{2}-\d{2}$/.test(startStr) ? startStr : todayStr;
  const end = /^\d{4}-\d{2}-\d{2}$/.test(endStr) && endStr >= start ? endStr : addDaysStr(start, 60);

  // Prefer the service-role client (no RLS dependency). Fall back to the
  // cookie/anon client, then to "no DB" — all of which fail open.
  const db = createAdminClient() ?? (isSupabaseConfigured() ? await createClient() : null);
  if (!db) {
    return buildAvailabilityRange(start, end, {}, todayStr);
  }

  try {
    // Widen the UTC query window by a day on each side so bookings near the
    // Denver day boundary are still captured before we bucket them by local day.
    const lowerISO = toUtcBoundary(start, -1);
    const upperISO = toUtcBoundary(end, +2);

    const { data: bookings, error } = await db
      .from("bookings")
      .select("scheduled_for, status")
      .in("status", ACTIVE_BOOKING_STATUSES as unknown as string[])
      .gte("scheduled_for", lowerISO)
      .lt("scheduled_for", upperISO);

    if (error) {
      console.warn("[ClearNest] availability query failed — failing open:", error.message);
      return buildAvailabilityRange(start, end, {}, todayStr);
    }

    const bookedByDate = bucketBookings(bookings ?? []);
    return buildAvailabilityRange(start, end, bookedByDate, todayStr);
  } catch (err) {
    console.error("[ClearNest] availability fetch threw — failing open:", err);
    return buildAvailabilityRange(start, end, {}, todayStr);
  }
}

/** YYYY-MM-DD shifted by N days, via UTC date math (DST-proof). */
function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** An ISO instant at UTC midnight of (dateStr + offsetDays) — a safe query bound. */
function toUtcBoundary(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + offsetDays);
  return dt.toISOString();
}
