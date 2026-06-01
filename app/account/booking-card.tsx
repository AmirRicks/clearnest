"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Calendar, X, Loader2 } from "lucide-react";
import { rescheduleBooking, cancelBooking } from "./actions";

export function AccountSignOut() {
  return (
    <form action="/api/account/signout" method="post">
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-4 py-2 text-sm font-medium text-charcoal hover:border-brand-300"
      >
        Sign out
      </button>
    </form>
  );
}

export function BookingActions({
  bookingId,
  scheduledFor,
}: {
  bookingId: string;
  scheduledFor: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const initial = new Date(scheduledFor);
  const [date, setDate] = useState(initial.toISOString().slice(0, 10));
  const [time, setTime] = useState(initial.toTimeString().slice(0, 5));

  const submit = () => {
    const iso = new Date(`${date}T${time}:00`).toISOString();
    start(async () => {
      const res = await rescheduleBooking(bookingId, iso);
      if (res.ok) {
        toast.success("Rescheduled — check email for confirmation.");
        setEditing(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  const onCancel = () => {
    if (!confirm("Cancel this booking? This can’t be undone here — call to restore.")) return;
    start(async () => {
      const res = await cancelBooking(bookingId);
      if (res.ok) toast.success("Booking canceled.");
      else toast.error(res.error);
    });
  };

  if (editing) {
    return (
      <div className="grid gap-2">
        <input
          type="date"
          value={date}
          min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-2xl border border-stone/70 bg-background px-3 py-2 text-sm"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded-2xl border border-stone/70 bg-background px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-charcoal px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full border border-stone/80 px-3 py-2 text-xs font-medium text-graphite"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 md:items-end">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone/80 bg-background px-3 py-1.5 text-xs font-medium text-charcoal hover:border-brand-300"
      >
        <Calendar className="h-3.5 w-3.5" />
        Reschedule
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger/5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" />
        Cancel booking
      </button>
    </div>
  );
}
