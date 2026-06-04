"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvailability, type DayAvailability, type TimeSlot } from "@/app/book/availability-action";

interface BookingCalendarProps {
  selectedDate: string;
  selectedTime: string;
  onSelect: (date: string, time: string) => void;
}

export function BookingCalendar({ selectedDate, selectedTime, onSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability when month changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    getAvailability(currentMonth.toISOString()).then((data) => {
      if (!isMounted) return;
      const map: Record<string, DayAvailability> = {};
      data.forEach(d => { map[d.date] = d; });
      setAvailability(map);
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      console.error("Failed to load availability:", err);
      setError("Could not load availability. Please try again.");
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Generate grid days (pad start and end of month to fill complete weeks)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const activeDateInfo = selectedDate ? availability[selectedDate] : null;

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-charcoal">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            disabled={isSameMonth(currentMonth, new Date())}
            className="p-2 rounded-full border border-stone-200 hover:bg-paper disabled:opacity-30 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full border border-stone-200 hover:bg-paper transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm text-center">
            {error}
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                getAvailability(currentMonth.toISOString()).then((data) => {
                  const map: Record<string, DayAvailability> = {};
                  data.forEach(d => { map[d.date] = d; });
                  setAvailability(map);
                  setLoading(false);
                }).catch((err) => {
                  console.error("Retry failed:", err);
                  setError("Still having trouble. Please refresh the page.");
                  setLoading(false);
                });
              }}
              className="ml-2 underline font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold uppercase tracking-wider text-graphite">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const info = availability[dateStr];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate === dateStr;
            const isPast = day < new Date(new Date().setHours(0,0,0,0));
            
            // UI States
            const isBusy = info?.status === "busy" || isPast;
            const isLimited = info?.status === "limited";
            const isFree = info?.status === "free";

            return (
              <button
                key={dateStr}
                onClick={() => {
                  if (!isBusy) onSelect(dateStr, ""); // Clear time when new date selected
                }}
                disabled={isBusy}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border",
                  !isCurrentMonth && "opacity-30",
                  isBusy && "cursor-not-allowed border-transparent opacity-40",
                  isSelected && "border-brand-500 bg-brand-50 shadow-soft",
                  !isSelected && !isBusy && "border-stone/40 hover:border-brand-300 hover:bg-paper/50 cursor-pointer"
                )}
              >
                <span className={cn(
                  "text-base font-medium",
                  isSelected ? "text-brand-700" : "text-charcoal"
                )}>
                  {format(day, "d")}
                </span>
                
                {/* Status Dot/Text exactly like wireframe */}
                {isCurrentMonth && !isPast && (
                  <span className={cn(
                    "text-[10px] mt-1 font-medium",
                    isBusy && "text-red-500",
                    isFree && "text-green-600",
                    isLimited && "text-amber-500"
                  )}>
                    {isBusy ? "Busy" : isFree ? "Free" : "Limited"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Selection */}
      <AnimatePresence>
        {selectedDate && activeDateInfo && activeDateInfo.status !== "busy" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 pt-6 border-t border-stone-200"
          >
            <h4 className="text-sm font-semibold text-charcoal mb-4">
              Select time for {format(new Date(selectedDate), "EEEE, MMMM d")}
            </h4>
            <div className="flex flex-wrap gap-3">
              {activeDateInfo.availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => onSelect(selectedDate, slot)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                    selectedTime === slot
                      ? "bg-charcoal text-white border-charcoal shadow-soft"
                      : "bg-background text-charcoal border-stone-300 hover:border-brand-400 hover:bg-paper"
                  )}
                >
                  {/* Convert 24h to 12h AM/PM */}
                  {parseInt(slot.split(":")[0]) > 12
                    ? `${parseInt(slot.split(":")[0]) - 12}:00 PM`
                    : parseInt(slot.split(":")[0]) === 12
                      ? "12:00 PM"
                      : `${parseInt(slot.split(":")[0])}:00 AM`}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {selectedDate && (!activeDateInfo || activeDateInfo.status === "busy") && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm">
          This date is currently unavailable. Please select another date.
        </div>
      )}
    </div>
  );
}
