"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Gift, Loader2, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { startGiftCheckout, type GiftFormState } from "@/app/(marketing)/gift-cards/actions";
import { GIFT_PRESETS, GIFT_MIN, GIFT_MAX } from "@/lib/gift";
import { BUSINESS } from "@/lib/utils";
import { trackEvent } from "@/components/analytics";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Taking you to checkout…
        </>
      ) : (
        <>
          Continue to secure payment <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

const inputClass =
  "w-full rounded-2xl border border-stone/80 bg-background px-4 py-3 text-sm text-charcoal outline-none transition placeholder:text-graphite/60 focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function GiftPurchaseForm({ enabled }: { enabled: boolean }) {
  const [state, action] = useActionState<GiftFormState, FormData>(startGiftCheckout, null);
  const [amount, setAmount] = useState<number>(GIFT_PRESETS[1].amount);
  const [custom, setCustom] = useState("");

  // On success the server returns the Stripe Checkout URL — send the buyer there.
  useEffect(() => {
    if (state?.ok && state.url) {
      trackEvent("gift_checkout_started", { amount });
      window.location.href = state.url;
    }
  }, [state, amount]);

  if (!enabled) {
    return (
      <div className="rounded-3xl border border-stone/70 bg-background p-7 shadow-soft">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Gift className="h-5 w-5" />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">
          Gift cards available by phone
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-graphite">
          We&rsquo;d love to set up a ClearNest gift card for you. Call or text and we&rsquo;ll
          handle the amount, the recipient, and a personal note — same day.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Phone className="h-4 w-4" /> {BUSINESS.phone}
          </a>
          <a
            href={BUSINESS.smsHref}
            className="inline-flex items-center gap-2 rounded-full border border-stone/80 px-5 py-2.5 text-sm font-medium text-charcoal hover:border-brand-300"
          >
            <MessageSquare className="h-4 w-4" /> Text us
          </a>
        </div>
      </div>
    );
  }

  const finalAmount = custom ? Number(custom) || 0 : amount;
  const customInvalid = Boolean(custom) && (finalAmount < GIFT_MIN || finalAmount > GIFT_MAX);

  return (
    <form action={action} className="rounded-3xl border border-stone/70 bg-background p-6 shadow-soft sm:p-7">
      {/* Amount */}
      <fieldset>
        <legend className="text-sm font-semibold text-charcoal">Choose an amount</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GIFT_PRESETS.map((p) => {
            const active = !custom && amount === p.amount;
            return (
              <button
                type="button"
                key={p.amount}
                onClick={() => {
                  setAmount(p.amount);
                  setCustom("");
                }}
                className={[
                  "rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition",
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-200"
                    : "border-stone/80 text-charcoal hover:border-brand-300",
                ].join(" ")}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-graphite">$</span>
            <input
              type="number"
              inputMode="numeric"
              min={GIFT_MIN}
              max={GIFT_MAX}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={`Custom amount ($${GIFT_MIN}–$${GIFT_MAX})`}
              className={`${inputClass} pl-7`}
              aria-label="Custom gift amount"
            />
          </div>
          {customInvalid && (
            <p className="mt-1 text-xs text-red-600">Enter an amount between ${GIFT_MIN} and ${GIFT_MAX}.</p>
          )}
        </div>
        {/* Hidden field actually submitted */}
        <input type="hidden" name="amount" value={finalAmount} />
      </fieldset>

      {/* Recipient */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-graphite" htmlFor="recipientName">Recipient name</label>
          <input id="recipientName" name="recipientName" required className={`${inputClass} mt-1`} placeholder="Jordan Smith" />
        </div>
        <div>
          <label className="text-xs font-medium text-graphite" htmlFor="recipientEmail">Recipient email</label>
          <input id="recipientEmail" name="recipientEmail" type="email" required className={`${inputClass} mt-1`} placeholder="jordan@email.com" />
        </div>
      </div>

      {/* Message */}
      <div className="mt-3">
        <label className="text-xs font-medium text-graphite" htmlFor="message">Personal note (optional)</label>
        <textarea id="message" name="message" rows={2} maxLength={480} className={`${inputClass} mt-1 resize-none`} placeholder="Enjoy a spotless home — you deserve it! 💛" />
      </div>

      {/* Purchaser */}
      <div className="mt-6 border-t border-stone/60 pt-5">
        <p className="text-sm font-semibold text-charcoal">Your details</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-graphite" htmlFor="purchaserName">Your name</label>
            <input id="purchaserName" name="purchaserName" required className={`${inputClass} mt-1`} placeholder="Alex Doe" />
          </div>
          <div>
            <label className="text-xs font-medium text-graphite" htmlFor="purchaserEmail">Your email</label>
            <input id="purchaserEmail" name="purchaserEmail" type="email" required className={`${inputClass} mt-1`} placeholder="alex@email.com" />
          </div>
        </div>
      </div>

      {state && !state.ok && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="mt-6">
        <SubmitButton />
        <p className="mt-3 text-center text-xs text-graphite">
          Secure payment via Stripe. The code is emailed to your recipient the moment payment clears.
          Gifts never expire.
        </p>
      </div>
    </form>
  );
}
