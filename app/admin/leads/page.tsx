import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SERVICES } from "@/lib/pricing";
import { formatDate } from "@/lib/utils";
import type { Lead } from "@/lib/supabase/types";
import { LeadRowActions } from "./lead-actions";

export default async function AdminLeads() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        Supabase isn’t configured yet — leads capture is disabled.
      </div>
    );
  }
  const sb = await createClient();
  const { data, error } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return <p className="text-sm text-danger">Failed to load: {error.message}</p>;

  const leads = (data ?? []) as Lead[];
  const open = leads.filter((l) => l.status === "new" || l.status === "contacted");
  const closed = leads.filter((l) => l.status === "won" || l.status === "lost");
  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <div className="grid gap-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Leads</h1>
        <p className="mt-1 text-sm text-graphite">
          {newCount} new · {open.length} open · {closed.length} closed. Speed-to-lead wins jobs —
          call new leads within the hour.
        </p>
      </header>

      <Section title="Open" leads={open} empty="No open leads yet. They’ll appear here from the quote forms." />
      {closed.length > 0 && <Section title="Closed" leads={closed} muted />}
    </div>
  );
}

function Section({
  title,
  leads,
  empty,
  muted,
}: {
  title: string;
  leads: Lead[];
  empty?: string;
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">{title}</h2>
      {leads.length === 0 ? (
        <p className="mt-3 text-sm text-graphite">{empty}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper/60 text-left text-[11px] uppercase tracking-[0.14em] text-graphite">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-stone/60 ${muted ? "opacity-80" : ""}`}>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-xs text-graphite">{formatDate(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{l.name || "—"}</div>
                    <div className="text-xs text-graphite">
                      {l.phone ? (
                        <a className="hover:text-charcoal" href={`tel:${l.phone}`}>{l.phone}</a>
                      ) : null}
                      {l.phone && l.email ? " · " : ""}
                      {l.email ? (
                        <a className="hover:text-charcoal" href={`mailto:${l.email}`}>{l.email}</a>
                      ) : null}
                    </div>
                    {l.message ? <div className="mt-1 text-xs text-graphite">“{l.message}”</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-graphite">
                      {l.source.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-graphite">
                    {l.estimated_low && l.estimated_high ? (
                      <div className="font-semibold text-charcoal">
                        ${l.estimated_low}–${l.estimated_high}
                      </div>
                    ) : (
                      "—"
                    )}
                    {l.service_id ? (
                      <div>{SERVICES[l.service_id as keyof typeof SERVICES]?.name ?? l.service_id}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={l.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <LeadRowActions leadId={l.id} status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: Lead["status"] }) {
  const map: Record<Lead["status"], string> = {
    new: "bg-amber-100 text-amber-800",
    contacted: "bg-brand-100 text-brand-800",
    won: "bg-success/20 text-success",
    lost: "bg-stone/60 text-graphite",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${map[status]}`}>
      {status}
    </span>
  );
}
