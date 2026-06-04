import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "./leads-table";

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

      <LeadsTable leads={leads || []} />
    </div>
  );
}
