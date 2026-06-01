"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus, sendInvoice } from "./actions";
import type { BookingStatus } from "@/lib/supabase/types";

const NEXT: Record<BookingStatus, BookingStatus | null> = {
  pending: "confirmed",
  confirmed: "in_progress",
  in_progress: "completed",
  completed: "invoiced",
  invoiced: "paid",
  paid: null,
  canceled: null,
};

export function BookingRowActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const [pending, start] = useTransition();
  const next = NEXT[currentStatus];

  const run = (status: BookingStatus) => {
    start(async () => {
      const res = await updateBookingStatus(bookingId, status);
      if (res.ok) toast.success(`Marked ${status.replace("_", " ")}.`);
      else toast.error(res.error);
    });
  };

  const invoice = () => {
    const input = window.prompt("Final invoice amount (USD) to charge after the clean:");
    if (!input) return;
    const amount = Number(input);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    start(async () => {
      const res = await sendInvoice(bookingId, amount);
      if (res.ok) toast.success("Invoice sent to customer.");
      else toast.error(res.error);
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      {currentStatus === "completed" && (
        <button
          type="button"
          disabled={pending}
          onClick={invoice}
          className="rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
        >
          Send invoice
        </button>
      )}
      {next && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(next)}
          className="rounded-full border border-stone/80 bg-background px-3 py-1 text-xs font-medium text-charcoal transition hover:border-brand-300 disabled:opacity-50"
        >
          Mark {next.replace("_", " ")}
        </button>
      )}
      {currentStatus !== "canceled" && currentStatus !== "completed" && currentStatus !== "paid" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run("canceled")}
          className="rounded-full border border-danger/40 bg-danger/5 px-3 py-1 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
