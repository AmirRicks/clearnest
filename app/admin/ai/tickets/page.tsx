import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TicketStatusActions } from "../_components/ticket-actions";

export const metadata = { title: "Support Tickets | ClearNest Admin" };

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  open: "bg-purple-100 text-purple-800 border-purple-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-stone-100 text-stone-600 border-stone-200",
};

export default async function TicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  const highCount = tickets?.filter((t: any) => t.priority === "high" && t.status !== "resolved" && t.status !== "closed").length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">Support Tickets</h1>
        {highCount > 0 && (
          <span className="rounded-full bg-red-100 text-red-800 border border-red-200 px-3 py-1 text-xs font-semibold">
            {highCount} high priority
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-stone/70 bg-background shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/60 bg-paper/50">
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Issue Type</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Date</th>
              </tr>
            </thead>
            <tbody>
              {(!tickets || tickets.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-graphite">No tickets yet.</td>
                </tr>
              )}
              {tickets?.map((t: any) => (
                <tr key={t.id} className={`border-b border-stone/40 hover:bg-paper/30 transition ${t.priority === "high" ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{t.customer_name || "Anonymous"}</div>
                    {t.customer_email && <div className="text-xs text-graphite">{t.customer_email}</div>}
                  </td>
                  <td className="px-4 py-3 text-graphite">{t.issue_type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[t.priority] || ""}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite max-w-xs truncate">{t.description || "—"}</td>
                  <td className="px-4 py-3">
                    <TicketStatusActions ticketId={t.id} currentStatus={t.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-graphite whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
