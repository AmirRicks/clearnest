import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SERVICES } from "@/lib/pricing";
import { formatDate, formatTime, formatCurrencyRange } from "@/lib/utils";
import { Section, Eyebrow } from "@/components/section";
import { AccountSignOut, BookingActions } from "./booking-card";

// Manual type definition
export interface Booking {
  id: string;
  created_at: string;
  service_id: string;
  scheduled_for: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  estimated_low: number;
  estimated_high: number;
  stripe_invoice_url: string | null;
}
import { LogIn } from "lucide-react";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <Section>
        <Eyebrow>Customer account</Eyebrow>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal">
          Accounts open once we’re live.
        </h1>
        <p className="mt-2 text-sm text-graphite">
          Sign-in by magic link will be available the moment Supabase is connected.
        </p>
        <Link
          href="/book"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white"
        >
          Book a cleaning
        </Link>
      </Section>
    );
  }

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user?.email) redirect("/account/login");

  const { data: bookings } = await sb
    .from("bookings")
    .select("*")
    .ilike("customer_email", user.email)
    .order("scheduled_for", { ascending: true });

  const list = (bookings ?? []) as Booking[];
  const now = Date.now();
  const upcoming = list.filter(
    (b) =>
      b.status !== "canceled" &&
      b.status !== "completed" &&
      b.status !== "paid" &&
      new Date(b.scheduled_for).getTime() >= now
  );
  const past = list.filter((b) => !upcoming.includes(b));

  return (
    <>
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Welcome back</Eyebrow>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              Hi {user.email}.
            </h1>
            <p className="mt-2 text-sm text-graphite">
              {upcoming.length} upcoming · {past.length} in history
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Book another cleaning
            </Link>
            <AccountSignOut />
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-stone/70 bg-paper/40 p-6 text-sm text-graphite">
            Nothing on the calendar.{" "}
            <Link href="/book" className="text-brand-700 underline">
              Book a cleaning
            </Link>{" "}
            and we’ll see you soon.
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} canManage />
            ))}
          </div>
        )}
      </Section>

      {past.length > 0 && (
        <Section className="pt-0">
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-graphite">History</h2>
          <div className="mt-4 grid gap-4">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function BookingCard({ booking, canManage }: { booking: Booking; canManage?: boolean }) {
  const service = SERVICES[booking.service_id as keyof typeof SERVICES];
  return (
    <article className="grid gap-4 rounded-3xl border border-stone/70 bg-background p-6 shadow-soft md:grid-cols-[1.5fr_1fr_auto] md:items-center">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight text-charcoal">
            {service?.name ?? booking.service_id}
          </span>
          <StatusPill status={booking.status} />
        </div>
        <div className="mt-1 text-sm text-graphite">
          {formatDate(booking.scheduled_for)} · {formatTime(booking.scheduled_for)}
        </div>
        <div className="mt-1 text-xs text-graphite">
          {booking.bedrooms} bd · {booking.bathrooms} ba · {booking.sqft.toLocaleString()} sq ft
        </div>
        <div className="mt-2 text-xs text-graphite">
          {booking.address_line1}
          {booking.address_line2 ? `, ${booking.address_line2}` : ""}, {booking.city}{" "}
          {booking.zip}
        </div>
      </div>
      <div className="text-sm">
        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-graphite">
          Estimated total
        </div>
        <div className="mt-1 text-xl font-semibold text-charcoal">
          {formatCurrencyRange(booking.estimated_low, booking.estimated_high)}
        </div>
        {booking.stripe_invoice_url && (
          <a
            href={booking.stripe_invoice_url}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 underline"
          >
            View invoice <LogIn className="h-3 w-3" />
          </a>
        )}
      </div>
      {canManage ? (
        <BookingActions
          bookingId={booking.id}
          scheduledFor={booking.scheduled_for}
        />
      ) : null}
    </article>
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
