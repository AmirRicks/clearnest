import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminCalendar } from "./_components/calendar";
import { SLOT_TIMES } from "@/lib/availability";

export const metadata = {
  title: "Calendar | ClearNest Admin",
};

const SERVICE_LABEL: Record<string, string> = {
  standard: "Standard",
  deep: "Deep",
  moveinout: "Move-In/Out",
  airbnb: "Airbnb",
};

// Confirmed jobs (brand teal) vs AI booking requests awaiting confirmation (amber).
const STATUS_COLOR: Record<string, string> = {
  pending: "#d9892f",
  confirmed: "#1f6c89",
  in_progress: "#2f8f6b",
  request: "#b4731f",
};

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const [bookingsRes, requestsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, scheduled_for, customer_name, service_id, status, city")
      .in("status", ["pending", "confirmed", "in_progress"]),
    supabase
      .from("booking_requests")
      .select("id, customer_name, cleaning_type, preferred_date, preferred_time, address, status")
      .in("status", ["new", "contacted"]),
  ]);

  if (bookingsRes.error) console.error("Calendar: bookings fetch error:", bookingsRes.error.message);
  if (requestsRes.error) console.error("Calendar: booking_requests fetch error:", requestsRes.error.message);

  const events: {
    id: string;
    title: string;
    start: string;
    allDay: boolean;
    color: string;
    extendedProps: Record<string, unknown>;
  }[] = [];

  // Confirmed bookings (have a precise timestamp).
  for (const b of bookingsRes.data || []) {
    const service = SERVICE_LABEL[b.service_id] || b.service_id || "Clean";
    events.push({
      id: `booking-${b.id}`,
      title: `${b.customer_name || "Booking"} · ${service}`,
      start: new Date(b.scheduled_for).toISOString(),
      allDay: false,
      color: STATUS_COLOR[b.status] || STATUS_COLOR.confirmed,
      extendedProps: { kind: "booking", service, status: b.status, city: b.city },
    });
  }

  // AI booking requests (preferred date/time may be loose — render best-effort).
  for (const r of requestsRes.data || []) {
    const service = SERVICE_LABEL[r.cleaning_type] || r.cleaning_type || "Requested clean";
    const dateOk = typeof r.preferred_date === "string" && /^\d{4}-\d{2}-\d{2}/.test(r.preferred_date);
    const timeOk = typeof r.preferred_time === "string" && SLOT_TIMES.includes(r.preferred_time as (typeof SLOT_TIMES)[number]);
    if (!dateOk) continue;
    const start = timeOk
      ? new Date(`${r.preferred_date.slice(0, 10)}T${r.preferred_time}:00`).toISOString()
      : `${r.preferred_date.slice(0, 10)}`;
    events.push({
      id: `request-${r.id}`,
      title: `⏳ ${r.customer_name || "Request"} · ${service}`,
      start,
      allDay: !timeOk,
      color: STATUS_COLOR.request,
      extendedProps: { kind: "request", service, status: r.status, address: r.address },
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-charcoal">Job Calendar</h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-graphite">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR.confirmed }} /> Confirmed</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR.pending }} /> Pending</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLOR.request }} /> AI request</span>
        </div>
      </div>
      <div className="rounded-3xl border border-stone/70 bg-background shadow-soft p-4 md:p-6">
        <AdminCalendar initialEvents={events} />
      </div>
    </div>
  );
}
