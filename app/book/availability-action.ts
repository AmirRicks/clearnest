"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";

export type TimeSlot = "08:00" | "10:00" | "12:00" | "14:00" | "16:00";
export const ALL_SLOTS: TimeSlot[] = ["08:00", "10:00", "12:00", "14:00", "16:00"];

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: "free" | "limited" | "busy";
  availableSlots: TimeSlot[];
}

function generateFreeAvailability(): DayAvailability[] {
  const result: DayAvailability[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + 60);

  for (let d = new Date(today); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, "yyyy-MM-dd");
    if (d <= today || d.getDay() === 0) {
      result.push({ date: dateStr, status: "busy", availableSlots: [] });
    } else {
      result.push({ date: dateStr, status: "free", availableSlots: [...ALL_SLOTS] });
    }
  }
  return result;
}

export async function getAvailability(monthDateStr: string): Promise<DayAvailability[]> {
  if (!isSupabaseConfigured()) return generateFreeAvailability();

  try {
    const supabase = await createClient();
    
    const baseDate = new Date(monthDateStr);
    const start = startOfMonth(isNaN(baseDate.getTime()) ? new Date() : baseDate);
    const end = endOfMonth(addMonths(start, 1));

    const bookedSlotsByDate: Record<string, Set<string>> = {};

    const { data: bookings } = await supabase
      .from("bookings")
      .select("scheduled_for")
      .in("status", ["pending", "confirmed", "in_progress", "paid", "invoiced"])
      .gte("scheduled_for", start.toISOString())
      .lte("scheduled_for", end.toISOString());

    if (bookings) {
      for (const b of bookings) {
        const d = new Date(b.scheduled_for);
        const dateStr = format(d, "yyyy-MM-dd");
        const timeStr = format(d, "HH:mm");
        if (!bookedSlotsByDate[dateStr]) bookedSlotsByDate[dateStr] = new Set();
        bookedSlotsByDate[dateStr].add(timeStr);
      }
    }

    const availability: DayAvailability[] = [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, "yyyy-MM-dd");
      if (d <= currentDate) {
        availability.push({ date: dateStr, status: "busy", availableSlots: [] });
        continue;
      }
      if (d.getDay() === 0) {
        availability.push({ date: dateStr, status: "busy", availableSlots: [] });
        continue;
      }
      const takenSlots = bookedSlotsByDate[dateStr] || new Set();
      const availableSlots = ALL_SLOTS.filter(slot => !takenSlots.has(slot));
      let status: "free" | "limited" | "busy" = "free";
      if (availableSlots.length === 0) status = "busy";
      else if (availableSlots.length <= 2) status = "limited";
      availability.push({ date: dateStr, status, availableSlots });
    }

    return availability;
  } catch (err) {
    console.error("Availability fetch error:", err);
    return generateFreeAvailability();
  }
}
