import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrencyRange } from "@/lib/utils";
import { BookingRowActions, type BookingStatus } from "../booking-actions";

export const metadata = {
  title: "Bookings | ClearNest Admin",
};

const SERVICE_LABEL: Record<string, string> = {
  standard: "Standard",
  deep: "Deep",
  moveinout: "Move-In/Out",
  airbnb: "Airbnb",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-brand-200 bg-brand-50 text-brand-700",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-success/30 bg-success/10 text-success",
  invoiced: "border-violet-200 bg-violet-50 text-violet-700",
  paid: "border-success/40 bg-success/15 text-success",
  canceled: "border-stone-300 bg-stone-100 text-stone-500",
};

type BookingRow = {
  id: string;
  scheduled_for: string;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  service_id: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  estimated_low: number | null;
  estimated_high: number | null;
  promo_code?: string | null;
  promo_discount_pct?: number | null;
};

const BASE_COLS =
  "id, scheduled_for, status, customer_name, customer_email, customer_phone, service_id, city, bedrooms, bathrooms, sqft, estimated_low, estimated_high";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  // Migration-safe read: try with the promo columns; if 0008 hasn't been run,
  // fall back to the base columns so the page never breaks.
  let bookings: BookingRow[];
  const withPromo = await supabase
    .from("bookings")
    .select(`${BASE_COLS}, promo_code, promo_discount_pct`)
    .order("scheduled_for", { ascending: false });
  if (withPromo.error) {
    const base = await supabase
      .from("bookings")
      .select(BASE_COLS)
      .order("scheduled_for", { ascending: false });
    bookings = (base.data ?? []) as unknown as BookingRow[];
  } else {
    bookings = (withPromo.data ?? []) as unknown as BookingRow[];
  }
  const counts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">Bookings</h1>
        <div className="flex flex-wrap gap-4 text-sm text-graphite">
          <span>Total: <strong className="text-charcoal">{bookings.length}</strong></span>
          <span>Upcoming: <strong className="text-brand-700">{(counts.pending ?? 0) + (counts.confirmed ?? 0)}</strong></span>
          <span>Completed: <strong className="text-success">{(counts.completed ?? 0) + (counts.invoiced ?? 0) + (counts.paid ?? 0)}</strong></span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone/70 bg-paper/50">
              <tr>
                <th className="px-5 py-4 font-semibold text-charcoal">Scheduled</th>
                <th className="px-5 py-4 font-semibold text-charcoal">Customer</th>
                <th className="px-5 py-4 font-semibold text-charcoal">Service</th>
                <th className="px-5 py-4 font-semibold text-charcoal">Est. total</th>
                <th className="px-5 py-4 font-semibold text-charcoal">Promo</th>
                <th className="px-5 py-4 font-semibold text-charcoal">Status</th>
                <th className="px-5 py-4 font-semibold text-charcoal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/60">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-graphite">
                    No bookings yet. They appear here when a customer books or you approve a lead.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const when = new Date(b.scheduled_for);
                  return (
                    <tr key={b.id} className="align-top transition hover:bg-paper/30">
                      <td className="px-5 py-4 text-charcoal">
                        <div className="font-medium">
                          {when.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-xs text-graphite">
                          {when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-charcoal">{b.customer_name || "—"}</div>
                        <div className="mt-0.5 flex flex-col gap-0.5 text-xs text-graphite">
                          {b.customer_phone && <span>{b.customer_phone}</span>}
                          {b.customer_email && <span>{b.customer_email}</span>}
                          {b.city && <span>{b.city}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-charcoal">
                        <div>{SERVICE_LABEL[b.service_id ?? ""] || b.service_id || "—"}</div>
                        <div className="text-xs text-graphite">
                          {b.bedrooms ?? "?"} bd · {b.bathrooms ?? "?"} ba · {(b.sqft ?? 0).toLocaleString()} sqft
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-charcoal">
                        {b.estimated_low != null && b.estimated_high != null
                          ? formatCurrencyRange(b.estimated_low, b.estimated_high)
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        {b.promo_code ? (
                          <span className="inline-flex items-center rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                            {b.promo_code}
                            {b.promo_discount_pct ? ` · ${b.promo_discount_pct}%` : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-graphite/60">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize " +
                            (STATUS_STYLE[b.status] || "border-stone-300 bg-stone-100 text-stone-600")
                          }
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <BookingRowActions
                          bookingId={b.id}
                          currentStatus={b.status as BookingStatus}
                          suggestedAmount={
                            b.estimated_low != null && b.estimated_high != null
                              ? Math.round((b.estimated_low + b.estimated_high) / 2)
                              : undefined
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
