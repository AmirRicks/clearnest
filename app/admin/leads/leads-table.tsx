"use client";

import { useState } from "react";
import { formatCurrencyRange } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { StatusSelect } from "./status-select";
import { ApproveModal } from "./approve-modal";
import { Sparkles, CalendarPlus } from "lucide-react";

// Manual type definition to bypass broken type generation
export type Lead = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  service_id: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  estimated_low: number | null;
  estimated_high: number | null;
  message: string | null;
  status: string;
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApproveClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone/70 bg-paper/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-charcoal">Date</th>
                <th className="px-6 py-4 font-semibold text-charcoal">Lead Info</th>
                <th className="px-6 py-4 font-semibold text-charcoal">Source</th>
                <th className="px-6 py-4 font-semibold text-charcoal">Status</th>
                <th className="px-6 py-4 font-semibold text-charcoal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/60">
              {leads?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-graphite">
                    No leads yet. They will appear here when submitted.
                  </td>
                </tr>
              ) : (
                leads?.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-paper/30">
                    <td className="px-6 py-4 text-graphite">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-charcoal">{lead.name || "—"}</div>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-graphite">
                        {lead.phone && (
                          <a href={"tel:" + lead.phone} className="hover:text-charcoal">
                            {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a href={"mailto:" + lead.email} className="hover:text-charcoal">
                            {lead.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusSelect id={lead.id} initialStatus={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lead.status === 'new' && (
                        <button 
                          onClick={() => handleApproveClick(lead)}
                          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" />
                          Approve & Book
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ApproveModal lead={selectedLead} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
}
