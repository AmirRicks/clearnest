import type { Metadata } from "next";
import { Users, Coins, HeartHandshake, Repeat, Sparkles } from "lucide-react";
import { Eyebrow, H2, Lead, Section } from "@/components/section";
import { Reveal } from "@/components/anim/reveal";
import { ReferralGenerator } from "@/components/referrals/referral-generator";
import { BUSINESS } from "@/lib/utils";

const BASE = "https://clearnest.services";

export const metadata: Metadata = {
  title: "Refer a Friend — Get $25, Give $25",
  description:
    "Share ClearNest with friends, family, or neighbors. They get $25 off their first cleaning, and you get $25 applied to your next clean.",
  alternates: { canonical: `${BASE}/referrals` },
};

const PERKS = [
  { icon: HeartHandshake, title: "They get $25 off", body: "When a friend uses your unique link to book their first cleaning with ClearNest, we instantly take $25 off their total." },
  { icon: Coins, title: "You get $25 credit", body: "Once their cleaning is completed, a $25 credit is automatically applied to your next recurring or one-time clean." },
  { icon: Repeat, title: "Unlimited earning", body: "There's no cap. Refer 10 friends, get $250 in cleaning credits. Your clean home could literally pay for itself." },
];

export default function ReferralsPage() {
  return (
    <>
      <Section className="pb-8">
        <Eyebrow><Users className="h-3.5 w-3.5 text-accent" /> ClearNest referral program</Eyebrow>
        <H2>Give $25. Get $25.</H2>
        <Lead>
          Good things are meant to be shared. Invite your friends, family, or neighbors to experience the peace of a professionally cleaned home. They get a discount, you get rewarded.
        </Lead>

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
                <Sparkles className="h-4 w-4 text-accent" /> Pro Tip
              </p>
              <p className="mt-2 text-sm text-graphite">
                Share your link in your neighborhood Facebook group or Nextdoor app. People are always asking for reliable, premium cleaners in {BUSINESS.serviceArea}.
              </p>
            </div>
          </div>

          {/* Right: generator form */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <ReferralGenerator />
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section className="bg-paper/40">
        <Eyebrow>The process</Eyebrow>
        <H2>How to refer and earn.</H2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", t: "Generate your link", b: "Enter your email above to get your unique referral link instantly. No sign-up required." },
            { n: "2", t: "Share with friends", b: "Text it, email it, or post it online. Anyone who clicks your link will automatically get $25 off at checkout." },
            { n: "3", t: "Earn free cleanings", b: "As soon as their first cleaning is complete, we'll email you a notification that you've earned a $25 credit." },
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
