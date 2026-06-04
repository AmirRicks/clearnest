"use server";

import { createClient } from "@/lib/supabase/server";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";

export type TimeSlot = "08:00" | "10:00" | "12:00" | "14:00" | "16:00";
export const ALL_SLOTS: TimeSlot[] = ["08:00", "10:00", "12:00", "14:00", "16:00"];

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: "free" | "limited" | "busy";
  availableSlots: TimeSlot[];
}

export async function getAvailability(monthDateStr: string): Promise<DayAvailability[]> {
  const supabase = await createClient();
  
  // Get the start of the requested month and end of the NEXT month (fetch 2 months at a time)
  const baseDate = new Date(monthDateStr);
  const start = startOfMonth(baseDate);
  const end = endOfMonth(addMonths(baseDate, 1));

  // Fetch all active bookings in this window
  const { data: bookings } = await supabase
    .from("bookings")
    .select("scheduled_for")
    .in("status", ["pending", "confirmed", "in_progress", "paid", "invoiced"])
    .gte("scheduled_for", start.toISOString())
    .lte("scheduled_for", end.toISOString());

  // Map bookings to dates and times
  const bookedSlotsByDate: Record<string, Set<string>> = {};
  
  if (bookings) {
    for (const b of bookings) {
      const d = new Date(b.scheduled_for);
      const dateStr = format(d, "yyyy-MM-dd");
      const timeStr = format(d, "HH:mm");
      
      if (!bookedSlotsByDate[dateStr]) {
        bookedSlotsByDate[dateStr] = new Set();
      }
      // Assuming a booking takes up a slot. In Phase 2, we can check crew capacity.
      // For now, 1 booking = 1 slot taken.
      bookedSlotsByDate[dateStr].add(timeStr);
    }
  }

  // Generate availability for the next 60 days
  const availability: DayAvailability[] = [];
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, "yyyy-MM-dd");
    
    // Can't book in the past, and require 24h notice (can't book today)
    if (d <= currentDate) {
      availability.push({
        date: dateStr,
        status: "busy",
        availableSlots: [],
      });
      continue;
    }

    // Sundays are off
    if (d.getDay() === 0) {
      availability.push({
        date: dateStr,
        status: "busy",
        availableSlots: [],
      });
      continue;
    }

    const takenSlots = bookedSlotsByDate[dateStr] || new Set();
    const availableSlots = ALL_SLOTS.filter(slot => !takenSlots.has(slot));

    let status: "free" | "limited" | "busy" = "free";
    if (availableSlots.length === 0) status = "busy";
    else if (availableSlots.length <= 2) status = "limited";

    availability.push({
      date: dateStr,
      status,
      availableSlots,
    });
  }

  return availability;
}
