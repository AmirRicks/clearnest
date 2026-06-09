import { ShieldCheck, Sparkles, Clock, Leaf, Star, CreditCard, MapPin, Home } from "lucide-react";
import { Marquee } from "@/components/anim/marquee";

const ITEMS = [
  { icon: ShieldCheck, label: "Insured & bonded" },
  { icon: CreditCard, label: "Pay after service" },
  { icon: Clock, label: "Same-day rescheduling" },
  { icon: Sparkles, label: "60-point checklist" },
  { icon: Leaf, label: "Family & pet safe" },
  { icon: Star, label: "Satisfaction promised" },
  { icon: MapPin, label: "Salt Lake County" },
  { icon: Home, label: "Locally owned" },
];

export function TrustMarquee() {
  return (
    <div className="border-y border-stone/60 bg-paper/50 py-5">
      <Marquee
        durationSec={32}
        items={ITEMS.map(({ icon: Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-2 text-charcoal">
            <Icon className="h-4 w-4 text-brand-600" />
            {label}
          </span>
        ))}
      />
    </div>
  );
}
