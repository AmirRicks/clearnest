import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "./leads-table";
import { getFirstCleanStatus, type BookingLite } from "@/lib/first-clean";

export const metadata = {
  title: "Leads Dashboard | ClearNest Admin",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  // Fetch leads + every booking's contact/status in parallel so we can tell,
  // for each lead, whether they're actually on their first clean.
  const [{ data: leads, error }, { data: bookings }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("bookings").select("customer_email, customer_phone, status"),
  ]);

  if (error) {
    console.error("Error fetching leads:", error);
    return <div>Error loading leads.</div>;
  }

  const bookingList = (bookings ?? []) as BookingLite[];
  const leadsWithEligibility = (leads ?? []).map((lead) => ({
    ...lead,
    firstClean: getFirstCleanStatus({ email: lead.email, phone: lead.phone }, bookingList),
  }));

  const eligibleCount = leadsWithEligibility.filter((l) => l.firstClean.eligible).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">
          Website Leads
        </h1>
        <div className="flex gap-4 text-sm text-graphite">
          <span>Total: <strong className="text-charcoal">{leads?.length || 0}</strong></span>
          <span>New: <strong className="text-blue-600">{leads?.filter(l => l.status === 'new').length || 0}</strong></span>
          <span>$25-off eligible: <strong className="text-success">{eligibleCount}</strong></span>
        </div>
      </div>

      <LeadsTable leads={leadsWithEligibility} />
    </div>
  );
}
