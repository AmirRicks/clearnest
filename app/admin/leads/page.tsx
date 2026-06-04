import { createClient } from "@/lib/supabase/server";
import { formatCurrencyRange } from "@/lib/utils";
import { StatusSelect } from "./status-select";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Leads Dashboard | ClearNest Admin",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return <div>Error loading leads.</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">
          Website Leads
        </h1>
        <div className="flex gap-4 text-sm text-graphite">
          <span>Total: <strong className="text-charcoal">{leads?.length || 0}</strong></span>
          <span>New: <strong className="text-blue-600">{leads?.filter(l => l.status === 'new').length || 0}</strong></span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone/70 bg-paper/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-charcoal">Date</th>
                <th className="px-6 py-4 font-semibold text-charcoal">Lead Info</th>
                <th className="px-6 py-4 font-semibold text-charcoal">Source</th>
                <th className="px-6 py-4 font-semibold text-charcoal">Estimated Quote</th>
                <th className="px-6 py-4 font-semibold text-charcoal">Status</th>
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
                    <td className="px-6 py-4 text-charcoal">
                      {lead.estimated_low && lead.estimated_high
                        ? formatCurrencyRange(lead.estimated_low, lead.estimated_high)
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusSelect id={lead.id} initialStatus={lead.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
