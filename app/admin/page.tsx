import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils";
import { SERVICES } from "@/lib/pricing";
import type { Booking } from "@/lib/supabase/types";
import { BookingRowActions } from "./booking-actions";

export default async function AdminBookings() {
  if (!isSupabaseConfigured()) {
    return <ConfigWarning />;
  }
  const sb = await createClient();
  const { data: bookings, error } = await sb
    .from("bookings")
    .select("*")
    .order("scheduled_for", { ascending: true })
    .limit(200);

  if (error) {
    return <p className="text-sm text-danger">Failed to load bookings: {error.message}</p>;
  }

  const upcoming = (bookings ?? []).filter(
    (b) => b.status !== "completed" && b.status !== "canceled" && b.status !== "paid"
  );
  const past = (bookings ?? []).filter(
    (b) => b.status === "completed" || b.status === "canceled" || b.status === "paid"
  );

  return (
    <div className="grid gap-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Bookings</h1>
        <p className="mt-1 text-sm text-graphite">
          {upcoming.length} upcoming · {past.length} in history
        </p>
      </header>

      <Section title="Upcoming" bookings={upcoming as Booking[]} />
      <Section title="History" bookings={past as Booking[]} muted />
    </div>
  );
}

function Section({
  title,
  bookings,
  muted,
}: {
  title: string;
  bookings: Booking[];
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-graphite">No bookings here yet.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-3xl border border-stone/70 bg-background shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-paper/60 text-left text-[11px] uppercase tracking-[0.14em] text-graphite">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/60">
              {bookings.map((b) => (
                <tr key={b.id} className={muted ? "opacity-80" : ""}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{formatDate(b.scheduled_for)}</div>
                    <div className="text-xs text-graphite">{formatTime(b.scheduled_for)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{b.customer_name}</div>
                    <div className="text-xs text-graphite">
                      {b.customer_phone} · {b.customer_email}
                    </div>
                    <div className="text-xs text-graphite">
                      {b.address_line1}, {b.city} {b.zip}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">
                      {SERVICES[b.service_id as keyof typeof SERVICES]?.name ?? b.service_id}
                    </div>
                    <div className="text-xs text-graphite">
                      {b.bedrooms} bd · {b.bathrooms} ba · {b.sqft.toLocaleString()} sq ft
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-charcoal">
                      ${b.estimated_low}–${b.estimated_high}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <BookingRowActions bookingId={b.id} currentStatus={b.status} />
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

function StatusPill({ status }: { status: Booking["status"] }) {
  const map: Record<Booking["status"], string> = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-brand-100 text-brand-800",
    in_progress: "bg-violet-100 text-violet-800",
    completed: "bg-success/20 text-success",
    invoiced: "bg-paper text-charcoal",
    paid: "bg-success/15 text-success",
    canceled: "bg-stone/60 text-graphite",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
        map[status],
      ].join(" ")}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function ConfigWarning() {
  return (
    <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
      <p className="font-semibold">Supabase isn’t configured yet.</p>
      <p className="mt-2">
        Set <code className="rounded bg-amber-100 px-1.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-amber-100 px-1.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your
        environment, then refresh. See the README for the bootstrap SQL.
      </p>
    </div>
  );
}
