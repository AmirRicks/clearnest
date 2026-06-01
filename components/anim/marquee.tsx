"use client";

import { cn } from "@/lib/utils";

/**
 * Marquee — seamless infinite horizontal scroll. Duplicates children so the
 * loop is gapless. CSS-driven (cheap).
 */
export function Marquee({
  items,
  className,
  durationSec = 28,
}: {
  items: React.ReactNode[];
  className?: string;
  durationSec?: number;
}) {
  return (
    <div className={cn("marquee-mask overflow-hidden", className)}>
      <div className="marquee-track gpu" style={{ ["--marquee-dur" as string]: `${durationSec}s` }}>
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            <ul className="flex items-center">
              {items.map((it, i) => (
                <li
                  key={`${dup}-${i}`}
                  className="flex items-center gap-3 whitespace-nowrap px-6 text-sm font-medium text-graphite"
                >
                  {it}
                  <span className="text-brand-300">•</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
