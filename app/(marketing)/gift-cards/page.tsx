import type { Metadata } from "next";
import { Gift, Clock, Infinity as InfinityIcon, HeartHandshake, Sparkles } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { Reveal } from "@/components/anim/reveal";
import { GiftPurchaseForm } from "@/components/gift/gift-purchase-form";

const BASE = "https://clearnest.services";

export const metadata: Metadata = {
  title: "Gift Cards — Give the Gift of a Clean Home",
  description:
    "Send a ClearNest cleaning gift card to friends or family in the Salt Lake area. Choose any amount, add a personal note, and we'll email it instantly. Gifts never expire.",
  alternates: { canonical: `${BASE}/gift-cards` },
};

const PERKS = [
  { icon: Clock, title: "Delivered instantly", body: "The code lands in your recipient's inbox the moment payment clears — perfect for last-minute gifts." },
  { icon: InfinityIcon, title: "Never expires", body: "No deadlines, no pressure. They redeem whenever the timing is right for them." },
  { icon: HeartHandshake, title: "A truly useful gift", body: "New baby, new home, surgery recovery, or just a busy season — a clean home is a gift people actually feel." },
];

const OCCASIONS = ["Housewarming", "New baby", "Get well soon", "Birthdays", "Realtor closing gift", "Just because"];

export default async function GiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { canceled } = await searchParams;
  const enabled = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <>
      <Section className="pb-8">
        <Eyebrow><Gift className="h-3.5 w-3.5 text-accent" /> ClearNest gift cards</Eyebrow>
        <H2>Give the gift of a spotless home.</H2>
        <Lead>
          Whether it&rsquo;s a housewarming, a new baby, or a friend who just needs a break — a
          ClearNest gift card is the thoughtful gift that gives back hours. Choose any amount, add a
          note, and we&rsquo;ll email it instantly.
        </Lead>

        {canceled && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            No worries — your payment was canceled and you weren&rsquo;t charged. Your gift is still
            here whenever you&rsquo;re ready.
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          {/* Left: value props */}
          <div className="order-2 lg:order-1">
            <div className="grid gap-5">
              {PERKS.map((p) => (
                <Reveal key={p.title}>
                  <div className="flex gap-4 rounded-3xl border border-stone/70 bg-background p-5 shadow-soft">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                      <p.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-charcoal">{p.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-graphite">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 rounded-3xl bg-paper/60 p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                <Sparkles className="h-4 w-4 text-accent" /> Perfect for
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <span key={o} className="rounded-full border border-stone/70 bg-background px-3 py-1 text-xs font-medium text-graphite">
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: purchase form */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <GiftPurchaseForm enabled={enabled} />
          </div>
        </div>
      </Section>

      {/* How redemption works */}
      <Section className="bg-paper/40">
        <Eyebrow>How it works</Eyebrow>
        <H2>Three easy steps.</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", t: "You buy it", b: "Pick an amount and add a personal note. Secure checkout via Stripe — takes a minute." },
            { n: "2", t: "They get it", b: "We email your recipient a beautiful gift card with a redemption code, instantly." },
            { n: "3", t: "They redeem it", b: "They book a clean and enter the code — we apply the balance to their visit. Easy." },
          ].map((s) => (
            <Reveal key={s.n}>
              <div className="glass-light glass-specular h-full rounded-3xl p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-charcoal text-lg font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-charcoal">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{s.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
