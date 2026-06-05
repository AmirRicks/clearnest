"use client";

import { useTransition } from "react";
import { updateTicketStatus } from "../actions";

const STATUS_OPTIONS = ["new", "open", "in_progress", "resolved", "closed"] as const;

export function TicketStatusActions({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(async () => {
      await updateTicketStatus(ticketId, e.target.value);
    });
  };

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={pending}
      className="rounded-lg border border-stone/70 bg-background px-2 py-1 text-xs font-medium text-charcoal focus:outline-none focus:border-brand-400 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}

const REFUND_STATUS_OPTIONS = ["new", "under_review", "approved", "denied", "more_info"] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;

export function RefundStatusActions({
  refundId,
  currentStatus,
}: {
  refundId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(async () => {
      await updateTicketStatus(refundId, e.target.value, "refund");
    });
  };

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={pending}
      className="rounded-lg border border-stone/70 bg-background px-2 py-1 text-xs font-medium text-charcoal focus:outline-none focus:border-brand-400 disabled:opacity-50"
    >
      {REFUND_STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}
