import { BUSINESS, formatCurrencyRange, formatDate, formatTime } from "@/lib/utils";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

let resendClient: import("resend").Resend | null = null;

async function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (resendClient) return resendClient;
  const { Resend } = await import("resend");
  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

async function send({ to, subject, html, replyTo }: SendArgs) {
  const client = await getResend();
  if (!client) {
    console.warn("[ClearNest email] RESEND_API_KEY missing — skipping send.", { to, subject });
    return { ok: true, skipped: true as const };
  }
  const from = process.env.RESEND_FROM ?? "ClearNest <hello@clearnest.services>";
  try {
    const res = await client.emails.send({
      from,
      to: [to],
      subject,
      html,
      replyTo,
    });
    if (res.error) {
      console.error("[ClearNest email] Resend error", res.error);
      return { ok: false as const, error: res.error.message };
    }
    return { ok: true as const, id: res.data?.id };
  } catch (err) {
    console.error("[ClearNest email] send threw", err);
    return { ok: false as const, error: "Email failed" };
  }
}

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f6f1;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1a1d22;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;padding:10px 16px;border-radius:999px;background:#1f6c89;color:#fff;font-weight:600;letter-spacing:.06em;font-size:13px;">ClearNest</div>
    </div>
    <div style="background:#fdfdfb;border:1px solid #e6e1d6;border-radius:24px;padding:28px 24px;box-shadow:0 1px 0 rgba(15,23,42,.04),0 30px 60px -30px rgba(15,23,42,.12);">
      <h1 style="margin:0 0 12px;font-size:22px;letter-spacing:-.02em;">${title}</h1>
      ${body}
    </div>
    <p style="margin:24px 0 0;text-align:center;font-size:12px;color:#4a5159;">
      ClearNest Cleaning Services &middot; ${BUSINESS.phone} &middot; ${BUSINESS.email}<br/>
      ${BUSINESS.serviceArea}
    </p>
  </div></body></html>`;
}

const row = (k: string, v: string) =>
  `<div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;font-size:14px;color:#1a1d22;"><span style="color:#4a5159;text-transform:uppercase;letter-spacing:.14em;font-size:11px;">${k}</span><span style="font-weight:600;">${v}</span></div>`;

export async function sendBookingConfirmation(input: {
  to: string;
  customerName: string;
  serviceName: string;
  scheduledFor: string; // ISO
  address: string;
  priceLow: number;
  priceHigh: number;
  bookingId: string;
}) {
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
      Hi ${escape(input.customerName)} — your ClearNest cleaning is on the calendar. We'll text you 24 hours and 1 hour before our crew arrives.
    </p>
    <div style="border-top:1px solid #e6e1d6;margin-top:16px;padding-top:16px;">
      ${row("Service", escape(input.serviceName))}
      ${row("When", `${formatDate(input.scheduledFor)} &middot; ${formatTime(input.scheduledFor)}`)}
      ${row("Address", escape(input.address))}
      ${row("Estimated total", formatCurrencyRange(input.priceLow, input.priceHigh))}
      ${row("Booking ID", input.bookingId.slice(0, 8))}
    </div>
    <div style="border-top:1px solid #e6e1d6;margin-top:16px;padding-top:16px;font-size:13px;color:#4a5159;line-height:1.6;">
      <strong style="color:#1a1d22;">You pay after the clean.</strong> We'll send a hosted invoice the day of service — card, Apple Pay, or Google Pay.
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#4a5159;">
      Need to reschedule? Reply to this email or call <a href="${BUSINESS.phoneHref}" style="color:#1b556c;">${BUSINESS.phone}</a>.
    </p>
  `;
  return send({
    to: input.to,
    subject: `You're booked with ClearNest — ${formatDate(input.scheduledFor)}`,
    html: shell(`You're booked!`, body),
    replyTo: BUSINESS.email,
  });
}

export async function sendRescheduleConfirmation(input: {
  to: string;
  customerName: string;
  oldFor: string;
  newFor: string;
  bookingId: string;
}) {
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
      Hi ${escape(input.customerName)} — your ClearNest visit has been moved.
    </p>
    ${row("From", `${formatDate(input.oldFor)} &middot; ${formatTime(input.oldFor)}`)}
    ${row("To", `${formatDate(input.newFor)} &middot; ${formatTime(input.newFor)}`)}
    ${row("Booking ID", input.bookingId.slice(0, 8))}
  `;
  return send({
    to: input.to,
    subject: `Rescheduled — ${formatDate(input.newFor)}`,
    html: shell("Your visit has been rescheduled.", body),
  });
}

export async function sendCancelConfirmation(input: {
  to: string;
  customerName: string;
  bookingId: string;
}) {
  return send({
    to: input.to,
    subject: "Your ClearNest booking has been canceled",
    html: shell(
      "Booking canceled.",
      `<p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
        Hi ${escape(input.customerName)} — your visit has been canceled. We'd love to see you again whenever you're ready: <a href="https://clearnest.vercel.app/book" style="color:#1b556c;">clearnest.vercel.app/book</a>.
      </p>
      ${row("Booking ID", input.bookingId.slice(0, 8))}`
    ),
  });
}

export async function sendInvoiceEmail(input: {
  to: string;
  customerName: string;
  hostedUrl: string;
  amount: number;
}) {
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
      Hi ${escape(input.customerName)} — thanks for choosing ClearNest. Your invoice is ready.
    </p>
    ${row("Amount due", new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(input.amount))}
    <p style="margin:20px 0;text-align:center;">
      <a href="${input.hostedUrl}" style="background:#1a1d22;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Pay invoice</a>
    </p>
    <p style="margin:0;font-size:13px;color:#4a5159;text-align:center;">
      Pay by card, Apple Pay, or Google Pay. Receipt sent automatically.
    </p>
  `;
  return send({
    to: input.to,
    subject: "Your ClearNest invoice",
    html: shell("Your invoice is ready.", body),
  });
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
