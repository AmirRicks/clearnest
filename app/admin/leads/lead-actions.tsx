"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateLeadStatus } from "../actions";
import type { LeadStatus } from "@/lib/supabase/types";

export function LeadRowActions({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [pending, start] = useTransition();

  const set = (s: LeadStatus) => {
    start(async () => {
      const res = await updateLeadStatus(leadId, s);
      if (res.ok) toast.success(`Marked ${s}.`);
      else toast.error(res.error);
    });
  };

  return (
    <div className="inline-flex flex-wrap items-center justify-end gap-2">
      {status === "new" && (
        <button type="button" disabled={pending} onClick={() => set("contacted")}
          className="rounded-full border border-stone/80 bg-background px-3 py-1 text-xs font-medium text-charcoal hover:border-brand-300 disabled:opacity-50">
          Mark contacted
        </button>
      )}
      {status !== "won" && (
        <button type="button" disabled={pending} onClick={() => set("won")}
          className="rounded-full border border-success/40 bg-success/5 px-3 py-1 text-xs font-medium text-success hover:bg-success/10 disabled:opacity-50">
          Won
        </button>
      )}
      {status !== "lost" && (
        <button type="button" disabled={pending} onClick={() => set("lost")}
          className="rounded-full border border-stone/70 bg-background px-3 py-1 text-xs font-medium text-graphite hover:border-stone disabled:opacity-50">
          Lost
        </button>
      )}
    </div>
  );
}
