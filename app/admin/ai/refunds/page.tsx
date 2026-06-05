import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RefundStatusActions } from "../_components/ticket-actions";
import { RefundAdminNotes } from "../_components/refund-notes";

export const metadata = { title: "Refund Requests | ClearNest Admin" };

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  under_review: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  denied: "bg-red-100 text-red-800 border-red-200",
  more_info: "bg-purple-100 text-purple-800 border-purple-200",
};

export default async function RefundsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const { data: refunds } = await supabase
    .from("refund_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-charcoal mb-6">Refund Requests</h1>

      <div className="rounded-2xl border border-stone/70 bg-background shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/60 bg-paper/50">
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Service Date</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Address</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Reason</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Admin Notes</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Date</th>
              </tr>
            </thead>
            <tbody>
              {(!refunds || refunds.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-graphite">No refund requests yet.</td>
                </tr>
              )}
              {refunds?.map((r: any) => (
                <tr key={r.id} className="border-b border-stone/40 hover:bg-paper/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{r.customer_name}</div>
                    {r.customer_email && <div className="text-xs text-graphite">{r.customer_email}</div>}
                  </td>
                  <td className="px-4 py-3 text-graphite text-xs whitespace-nowrap">
                    {r.service_date || "—"}
                  </td>
                  <td className="px-4 py-3 text-graphite max-w-[120px] truncate text-xs">
                    {r.address || "—"}
                  </td>
                  <td className="px-4 py-3 text-graphite max-w-[200px] truncate">
                    {r.reason}
                  </td>
                  <td className="px-4 py-3">
                    <RefundStatusActions refundId={r.id} currentStatus={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <RefundAdminNotes refundId={r.id} currentNotes={r.admin_notes || ""} />
                  </td>
                  <td className="px-4 py-3 text-xs text-graphite whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
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
