/**
 * Availability — single source of truth for scheduling.
 *
 * Used by BOTH the customer booking calendar (`components/booking-calendar.tsx`
 * via `app/book/availability-action.ts`) AND the AI receptionist
 * (`lib/ai/actions.ts`). Keeping the logic here means the two can never
 * disagree about what's bookable.
 *
 * Design rules learned the hard way:
 *  1. PIN TO THE BUSINESS TIMEZONE. All "what day is it / what time is a slot"
 *     math is done in America/Denver via Intl — never server-local time, which
 *     is UTC on Vercel and caused off-by-one "everything is unavailable" bugs.
 *  2. FAIL OPEN. A future open-day with no booking data is FREE, not
 *     "unavailable". For a booking funnel, the cost of showing a bookable day
 *     we later reschedule is tiny; the cost of hiding every day is the whole
 *     business. Unknown ⇒ available.
 *
 * This module is isomorphic (no server-only imports) so the client calendar and
 * server actions can both import it.
 */

export const BUSINESS_TIMEZONE = "America/Denver";

/** Days the business operates. 0=Sun … 6=Sat. Tue–Sat matches the advertised
 *  hours (BUSINESS.hours) and the JSON-LD openingHours. Change here and the
 *  calendar, the AI, and validation all move together. */
export const OPEN_DAYS: readonly number[] = [2, 3, 4, 5, 6];

/** Bookable start times (24h). A 2-hour grid from 7am to 5pm. */
export const SLOT_TIMES = ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00"] as const;
export type TimeSlot = (typeof SLOT_TIMES)[number];

/** Booking statuses that occupy a slot (so it can't be double-booked). */
export const ACTIVE_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "paid",
  "invoiced",
] as const;

export type DayStatus = "free" | "limited" | "busy" | "closed" | "past";

export interface DayAvailability {
  date: string; // YYYY-MM-DD (Denver calendar date)
  status: DayStatus;
  availableSlots: TimeSlot[];
}

// ---------------------------------------------------------------------------
// Timezone-safe primitives (Intl-based, no external deps)
// ---------------------------------------------------------------------------

/** "YYYY-MM-DD" for an instant, as seen in the business timezone. */
export function denverDateStr(d: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** "HH:mm" (24h) for an instant, as seen in the business timezone. */
export function denverTimeStr(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hh}:${mm}`;
}

/** Day of week (0=Sun … 6=Sat) for a YYYY-MM-DD calendar date.
 *  A calendar date's weekday is timezone-independent, so we read it off a
 *  fixed noon-UTC instant — no DST or off-by-one risk. */
export function dayOfWeekForDateStr(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

export function isOpenDay(dateStr: string): boolean {
  return OPEN_DAYS.includes(dayOfWeekForDateStr(dateStr));
}

/** The next calendar day's YYYY-MM-DD. DST-proof (pure UTC date math). */
export function nextDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

/** 12-hour label for a slot, e.g. "07:00" → "7:00 AM". */
export function slotLabel(slot: string): string {
  const h = parseInt(slot.split(":")[0], 10);
  if (h === 0) return "12:00 AM";
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return "12:00 PM";
  return `${h - 12}:00 PM`;
}

// ---------------------------------------------------------------------------
// Core availability logic (fail-open)
// ---------------------------------------------------------------------------

/**
 * Status for a single day. `bookedSlots` is the set of taken "HH:mm" for that
 * day. Omit / pass empty when unknown — we FAIL OPEN (future open day ⇒ free).
 *
 * Today is treated as not-bookable (24-hour notice), so the first bookable day
 * is tomorrow.
 */
export function computeDayAvailability(
  dateStr: string,
  bookedSlots?: Set<string> | string[],
  todayStr: string = denverDateStr(),
): DayAvailability {
  if (dateStr <= todayStr) {
    return { date: dateStr, status: "past", availableSlots: [] };
  }
  if (!isOpenDay(dateStr)) {
    return { date: dateStr, status: "closed", availableSlots: [] };
  }
  const taken = bookedSlots instanceof Set ? bookedSlots : new Set(bookedSlots ?? []);
  const availableSlots = SLOT_TIMES.filter((s) => !taken.has(s));
  let status: DayStatus = "free";
  if (availableSlots.length === 0) status = "busy";
  else if (availableSlots.length <= 2) status = "limited";
  return { date: dateStr, status, availableSlots: [...availableSlots] };
}

/**
 * Availability for an inclusive range of YYYY-MM-DD strings. `bookedByDate`
 * maps a date to its taken "HH:mm" slots; any date absent from the map fails
 * open. The range should match exactly what the UI renders so there are never
 * "holes" the calendar can't look up.
 */
export function buildAvailabilityRange(
  startStr: string,
  endStr: string,
  bookedByDate: Record<string, string[]> = {},
  todayStr: string = denverDateStr(),
): DayAvailability[] {
  const out: DayAvailability[] = [];
  let ds = startStr;
  // Guard against a malformed range (avoid an unbounded loop).
  let guard = 0;
  while (ds <= endStr && guard < 400) {
    out.push(computeDayAvailability(ds, bookedByDate[ds], todayStr));
    ds = nextDateStr(ds);
    guard++;
  }
  return out;
}

/** Bucket raw booking rows into a date→["HH:mm"] map, in Denver time. */
export function bucketBookings(
  rows: { scheduled_for: string }[],
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const r of rows) {
    if (!r?.scheduled_for) continue;
    const d = new Date(r.scheduled_for);
    if (isNaN(d.getTime())) continue;
    const ds = denverDateStr(d);
    (map[ds] ??= []).push(denverTimeStr(d));
  }
  return map;
}
