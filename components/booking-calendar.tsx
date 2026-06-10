"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailability } from "@/app/book/availability-action";
import { computeDayAvailability, denverDateStr, slotLabel, type DayAvailability } from "@/lib/availability";

interface BookingCalendarProps {
  selectedDate: string;
  selectedTime: string;
  onSelect: (date: string, time: string) => void;
}

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

export function BookingCalendar({ selectedDate, selectedTime, onSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The exact grid we render (Mon-started weeks, padded to full weeks).
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const todayStr = denverDateStr();

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    // Ask for availability across the precise visible range so every rendered
    // cell has a matching entry (no holes → no false "unavailable").
    getAvailability(fmt(startDate), fmt(endDate))
      .then((data) => {
        if (!active) return;
        const map: Record<string, DayAvailability> = {};
        data.forEach((d) => { map[d.date] = d; });
        setAvailability(map);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load availability:", err);
        // Fail open even on transport error: show the month as bookable rather
        // than blocking the funnel. We still surface a soft notice.
        setError("Showing our standard schedule — pick any open date and we'll confirm.");
        setLoading(false);
      });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fmt(startDate), fmt(endDate)]);

  useEffect(() => load(), [load]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Always resolve a status, even if the fetch missed a cell (fail open).
  const infoFor = (dateStr: string): DayAvailability =>
    availability[dateStr] ?? computeDayAvailability(dateStr, undefined, todayStr);

  const activeDateInfo = selectedDate ? infoFor(selectedDate) : null;
  const isBookable = (s: DayAvailability["status"]) => s === "free" || s === "limited";

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-charcoal">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            disabled={isSameMonth(currentMonth, new Date())}
            aria-label="Previous month"
            className="p-2 rounded-full border border-stone-200 hover:bg-paper disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="p-2 rounded-full border border-stone-200 hover:bg-paper transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm text-center">
            {error}
          </div>
        )}

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold uppercase tracking-wider text-graphite">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day) => {
            const dateStr = fmt(day);
            const info = infoFor(dateStr);
            const status = info.status;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate === dateStr;
            const bookable = isBookable(status);

            const label =
              status === "free" ? "Free" :
              status === "limited" ? "Limited" :
              status === "busy" ? "Busy" :
              status === "closed" ? "Closed" : "";

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => { if (bookable) onSelect(dateStr, ""); }}
                disabled={!bookable}
                aria-label={`${format(day, "EEEE, MMMM d")}${label ? " — " + label : ""}`}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border",
                  !isCurrentMonth && "opacity-30",
                  !bookable && "cursor-not-allowed border-transparent opacity-40",
                  isSelected && "border-brand-500 bg-brand-50 shadow-soft",
                  !isSelected && bookable && "border-stone/40 hover:border-brand-300 hover:bg-paper/50 cursor-pointer"
                )}
              >
                <span className={cn("text-base font-medium", isSelected ? "text-brand-700" : "text-charcoal")}>
                  {format(day, "d")}
                </span>
                {isCurrentMonth && label && (
                  <span className={cn(
                    "text-[10px] mt-1 font-medium",
                    status === "busy" && "text-red-500",
                    status === "free" && "text-green-600",
                    status === "limited" && "text-amber-500",
                    status === "closed" && "text-graphite/60"
                  )}>
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <AnimatePresence>
        {selectedDate && activeDateInfo && isBookable(activeDateInfo.status) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 pt-6 border-t border-stone-200"
          >
            <h4 className="text-sm font-semibold text-charcoal mb-4">
              Select time for {format(new Date(`${selectedDate}T12:00:00`), "EEEE, MMMM d")}
            </h4>
            <div className="flex flex-wrap gap-3">
              {activeDateInfo.availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelect(selectedDate, slot)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                    selectedTime === slot
                      ? "bg-charcoal text-white border-charcoal shadow-soft"
                      : "bg-background text-charcoal border-stone-300 hover:border-brand-400 hover:bg-paper"
                  )}
                >
                  {slotLabel(slot)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDate && activeDateInfo && !isBookable(activeDateInfo.status) && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm">
          That date isn’t available. Please choose another open date.
        </div>
      )}
    </div>
  );
}
