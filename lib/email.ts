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
  // Use a verified-domain sender once clearnest.services is verified in Resend.
  // Until then, onboarding@resend.dev works (delivers to the Resend account owner).
  const from = process.env.RESEND_FROM?.trim() || "ClearNest <onboarding@resend.dev>";
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
    replyTo: BUSINESS.email,
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
        Hi ${escape(input.customerName)} — your visit has been canceled. We'd love to see you again whenever you're ready: <a href="https://clearnest.services/book" style="color:#1b556c;">clearnest.services/book</a>.
      </p>
      ${row("Booking ID", input.bookingId.slice(0, 8))}`
    ),
    replyTo: BUSINESS.email,
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
    replyTo: BUSINESS.email,
  });
}

/** Notify the owner when a new lead comes in (so you can follow up fast). */
export async function sendLeadNotification(lead: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string;
  message?: string | null;
  estimated_low?: number | null;
  estimated_high?: number | null;
}) {
  const to = process.env.LEAD_NOTIFY_EMAIL || BUSINESS.email;
  const quote =
    lead.estimated_low && lead.estimated_high
      ? formatCurrencyRange(lead.estimated_low, lead.estimated_high)
      : "—";
  const digits = (lead.phone || "").replace(/[^0-9+]/g, "");
  const actions = digits
    ? `<p style="margin:20px 0 4px;text-align:center;">
        <a href="tel:${digits}" style="display:inline-block;background:#1a1d22;color:#fff;padding:11px 20px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">📞 Call ${escape(lead.phone || "")}</a>
        &nbsp;&nbsp;
        <a href="sms:${digits}" style="display:inline-block;background:#1f6c89;color:#fff;padding:11px 20px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">💬 Text now</a>
      </p>
      <p style="margin:0;text-align:center;font-size:12px;color:#4a5159;">Tip: leads contacted within 5 minutes are ~21× more likely to book.</p>`
    : "";
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">New lead from the website — follow up fast (speed-to-lead wins jobs).</p>
    ${row("Name", escape(lead.name || "—"))}
    ${row("Phone", escape(lead.phone || "—"))}
    ${row("Email", escape(lead.email || "—"))}
    ${row("Source", escape(lead.source || "website"))}
    ${row("Quote", quote)}
    ${lead.message ? row("Message", escape(lead.message)) : ""}
    ${actions}
  `;
  return send({
    to,
    subject: `🌿 New ClearNest lead — ${lead.name || lead.phone || "website"}`,
    html: shell("New lead — reply fast!", body),
    // Reply goes straight to the customer (speed-to-lead).
    replyTo: lead.email || undefined,
  });
}

/**
 * Instant auto-reply to the customer the moment they submit a lead.
 * Speed-to-lead: acknowledging instantly dramatically lifts conversion.
 * (Delivers to any address once the Resend sending domain is verified; until
 * then onboarding@resend.dev only reaches the account owner — see SETUP-LIVE.md.)
 */
export async function sendLeadAutoReply(input: {
  to: string;
  customerName?: string | null;
}) {
  const first = input.customerName?.trim().split(" ")[0];
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
      Hi ${first ? escape(first) : "there"} — thanks for reaching out to ClearNest! We've got your request and we'll text or email your quote shortly. We answer Tuesday–Saturday, 7am–7pm.
    </p>
    <div style="border-top:1px solid #e6e1d6;margin-top:16px;padding-top:16px;font-size:13px;color:#4a5159;line-height:1.6;">
      <strong style="color:#1a1d22;">Want the fastest answer?</strong> Text or call us at
      <a href="${BUSINESS.phoneHref}" style="color:#1b556c;font-weight:600;">${BUSINESS.phone}</a>.
      <br/><br/>
      And remember — with ClearNest you <strong style="color:#1a1d22;">pay after the clean</strong>, never a deposit. Insured, bonded, and eco &amp; pet-safe.
    </div>
  `;
  return send({
    to: input.to,
    subject: "We got your request — ClearNest 🌿",
    html: shell("Thanks for reaching out!", body),
    replyTo: BUSINESS.email,
  });
}

/** Ask a happy customer for a review (the engine that turns jobs into reviews). */
export async function sendReviewRequest(input: {
  to: string;
  customerName: string;
  yelpUrl: string;
  googleUrl?: string;
}) {
  const buttons = `
    <p style="margin:20px 0;text-align:center;">
      <a href="${input.googleUrl || input.yelpUrl}" style="background:#1a1d22;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Leave a review</a>
    </p>
    <p style="margin:0;text-align:center;font-size:13px;">
      <a href="${input.yelpUrl}" style="color:#1b556c;">Review on Yelp</a>${input.googleUrl ? ` &nbsp;·&nbsp; <a href="${input.googleUrl}" style="color:#1b556c;">Review on Google</a>` : ""}
    </p>`;
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
      Hi ${escape(input.customerName)} — thank you for choosing ClearNest! If your clean made your day a little easier, a quick review would mean the world to a new local business — and helps the next family find us.
    </p>
    ${buttons}
  `;
  return send({
    to: input.to,
    subject: "How did we do? 🌿",
    html: shell("Mind leaving a quick review?", body),
    replyTo: BUSINESS.email,
  });
}

function giftCodeBlock(code: string, amount: number) {
  return `
    <div style="margin:18px 0;text-align:center;background:#eef6f9;border:1px dashed #1f6c89;border-radius:18px;padding:20px;">
      <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#1b556c;">Gift value</div>
      <div style="font-size:34px;font-weight:700;letter-spacing:-.02em;color:#16323d;margin:2px 0 12px;">$${amount}</div>
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#4a5159;">Redemption code</div>
      <div style="font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:22px;font-weight:700;letter-spacing:.06em;color:#16323d;margin-top:4px;">${escape(code)}</div>
    </div>`;
}

export async function sendGiftCardToRecipient(input: {
  to: string;
  recipientName: string;
  purchaserName: string;
  amount: number; // dollars
  code: string;
  message?: string;
}) {
  const note = input.message?.trim()
    ? `<p style="margin:0 0 16px;color:#4a5159;line-height:1.6;font-style:italic;">&ldquo;${escape(input.message.trim())}&rdquo;</p>`
    : "";
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
      Hi ${escape(input.recipientName)} — <strong>${escape(input.purchaserName)}</strong> sent you the gift of a spotless home from ClearNest Cleaning Services. 🌿
    </p>
    ${note}
    ${giftCodeBlock(input.code, input.amount)}
    <p style="margin:16px 0;color:#4a5159;line-height:1.6;">
      To redeem, book your clean below and enter this code in the booking notes — we&rsquo;ll apply your gift balance to the invoice. No rush; your gift doesn&rsquo;t expire.
    </p>
    <p style="margin:20px 0;text-align:center;">
      <a href="https://clearnest.services/book" style="background:#1a1d22;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Book your clean</a>
    </p>`;
  return send({
    to: input.to,
    subject: `🎁 ${input.purchaserName} sent you a ClearNest gift card`,
    html: shell("You've received a gift!", body),
    replyTo: BUSINESS.email,
  });
}

export async function sendGiftReceipt(input: {
  to: string;
  purchaserName: string;
  recipientName: string;
  recipientEmail: string;
  amount: number; // dollars
  code: string;
}) {
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">
      Thank you, ${escape(input.purchaserName)}! Your ClearNest gift card is on its way to <strong>${escape(input.recipientName)}</strong> (${escape(input.recipientEmail)}).
    </p>
    ${giftCodeBlock(input.code, input.amount)}
    <p style="margin:16px 0;color:#4a5159;line-height:1.6;">
      We&rsquo;ve emailed them the code and how to redeem it. Keep this receipt for your records — if they ever misplace the code, just reply to this email and we&rsquo;ll resend it.
    </p>`;
  return send({
    to: input.to,
    subject: "Your ClearNest gift card — receipt",
    html: shell("Gift card confirmed 🎉", body),
    replyTo: BUSINESS.email,
  });
}

/**
 * Notify the owner immediately when the AI receptionist flags something urgent
 * — a refund request or a high-priority complaint (property damage, safety, an
 * angry customer). Goes to LEAD_NOTIFY_EMAIL so it can be actioned fast.
 */
export async function sendEscalationNotification(input: {
  kind: "refund" | "complaint" | "support";
  priority?: "low" | "medium" | "high";
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  serviceDate?: string | null;
  address?: string | null;
  details: string;
}) {
  const to = process.env.LEAD_NOTIFY_EMAIL || BUSINESS.email;
  const heading =
    input.kind === "refund" ? "⚠️ Refund request" :
    input.priority === "high" ? "🚨 HIGH PRIORITY complaint" : "New support request";
  const digits = (input.phone || "").replace(/[^0-9+]/g, "");
  const actions = digits
    ? `<p style="margin:20px 0 0;text-align:center;">
        <a href="tel:${digits}" style="display:inline-block;background:#1a1d22;color:#fff;padding:11px 20px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">📞 Call ${escape(input.phone || "")}</a>
      </p>`
    : "";
  const body = `
    <p style="margin:0 0 16px;color:#4a5159;line-height:1.6;">The AI receptionist flagged this for your review${input.kind === "refund" ? " — only you can approve a refund." : "."}</p>
    ${row("Type", escape(input.kind))}
    ${input.priority ? row("Priority", escape(input.priority.toUpperCase())) : ""}
    ${row("Name", escape(input.name || "—"))}
    ${row("Phone", escape(input.phone || "—"))}
    ${row("Email", escape(input.email || "—"))}
    ${input.serviceDate ? row("Service date", escape(input.serviceDate)) : ""}
    ${input.address ? row("Address", escape(input.address)) : ""}
    ${row("Details", escape(input.details))}
    ${actions}
  `;
  return send({
    to,
    subject: `${heading} — ClearNest`,
    html: shell(heading, body),
    replyTo: input.email || undefined,
  });
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
