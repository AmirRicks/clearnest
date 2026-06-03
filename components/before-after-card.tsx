"use client";

import { BeforeAfter } from "@/components/before-after";
import type { BeforeAfterPair } from "@/lib/before-after";

export function BeforeAfterPairCard({ pair }: { pair: BeforeAfterPair }) {
  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-stone/70 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <BeforeAfter
        beforeSrc={pair.beforeSrc}
        afterSrc={pair.afterSrc}
        width={pair.width}
        height={pair.height}
        label={pair.label}
        category={pair.category}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
        <h4 className="text-base font-semibold tracking-tight text-white">{pair.label}</h4>
        <p className="mt-0.5 text-xs text-white/80">{pair.category}</p>
      </div>
    </div>
  );
}
