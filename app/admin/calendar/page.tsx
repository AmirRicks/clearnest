import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminCalendar } from "./_components/calendar";

export const metadata = {
  title: "Calendar | ClearNest Admin",
};

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return redirect("/admin/login");

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, scheduled_for, customer_name, service_id, status")
    .in("status", ["pending", "confirmed", "in_progress"]);

  if (error) {
    console.error("Error fetching bookings for calendar:", error);
    // Handle error gracefully in the component
  }
  
  const events = (bookings || []).map(b => ({
    id: b.id,
    title: b.customer_name || 'Unnamed Booking',
    start: new Date(b.scheduled_for),
    // You could add an end time based on service duration later
    // end: new Date(new Date(b.scheduled_for).getTime() + 3 * 60 * 60 * 1000), 
    allDay: false,
    extendedProps: {
      service: b.service_id,
      status: b.status
    }
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-charcoal mb-6">
        Job Calendar
      </h1>
      <div className="rounded-3xl border border-stone/70 bg-background shadow-soft p-4 md:p-6">
        <AdminCalendar initialEvents={events} />
      </div>
    </div>
  );
}
