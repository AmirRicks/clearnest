"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "./actions";

interface StatusSelectProps {
  id: string;
  initialStatus: string;
}

const STATUSES = ["new", "contacted", "won", "lost"];

export function StatusSelect({ id, initialStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateLeadStatus(id, newStatus);
    });
  };

  return (
    <div className="relative">
      <select
        defaultValue={initialStatus}
        onChange={handleChange}
        disabled={isPending}
        className={
          "appearance-none rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider outline-none transition disabled:opacity-50 " +
          (initialStatus === "new"
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : initialStatus === "contacted"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : initialStatus === "won"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-stone-200 bg-stone-100 text-stone-600")
        }
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <svg className="h-3 w-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
