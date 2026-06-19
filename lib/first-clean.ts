/**
 * First-clean eligibility — does a lead qualify for the founding
 * "$25 off your first clean" offer?
 *
 * A lead qualifies ONLY if they've never had a clean delivered. We match a lead
 * to past bookings by normalized email OR phone (last 10 digits), so the same
 * person is recognized even if they typed their number/email slightly
 * differently across submissions.
 *
 * Booking statuses that mean a clean was actually delivered: completed,
 * invoiced, paid. A merely upcoming booking (pending/confirmed/in_progress)
 * means their first clean is already scheduled — still not a NEW discount, but
 * a distinct state the owner should see.
 */

export type FirstCleanStatus = "first-time" | "upcoming" | "returning" | "unknown";

export type BookingLite = {
  customer_email: string | null;
  customer_phone: string | null;
  status: string | null;
};

export type FirstCleanResult = {
  status: FirstCleanStatus;
  eligible: boolean; // true = OK to give the $25-off first-clean offer
  served: number; // cleans actually delivered to this contact
  upcoming: number; // bookings scheduled but not yet served
};

const SERVED_STATUSES = new Set(["completed", "invoiced", "paid"]);

const normEmail = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

const phoneTail = (s: string | null | undefined) => {
  const d = (s ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : ""; // last 10 digits ignores +1 / formatting
};

export function getFirstCleanStatus(
  lead: { email: string | null; phone: string | null },
  bookings: BookingLite[]
): FirstCleanResult {
  const email = normEmail(lead.email);
  const phone = phoneTail(lead.phone);

  if (!email && !phone) {
    return { status: "unknown", eligible: false, served: 0, upcoming: 0 };
  }

  const matches = bookings.filter((b) => {
    const bEmail = normEmail(b.customer_email);
    const bPhone = phoneTail(b.customer_phone);
    return (email && bEmail && bEmail === email) || (phone && bPhone && bPhone === phone);
  });

  if (matches.length === 0) {
    return { status: "first-time", eligible: true, served: 0, upcoming: 0 };
  }

  const served = matches.filter((b) => SERVED_STATUSES.has((b.status ?? "").toLowerCase())).length;
  const upcoming = matches.filter((b) => {
    const s = (b.status ?? "").toLowerCase();
    return !SERVED_STATUSES.has(s) && s !== "canceled";
  }).length;

  if (served > 0) return { status: "returning", eligible: false, served, upcoming };
  if (upcoming > 0) return { status: "upcoming", eligible: false, served: 0, upcoming };
  // only canceled bookings on file → never actually served → still a first-timer
  return { status: "first-time", eligible: true, served: 0, upcoming: 0 };
}
