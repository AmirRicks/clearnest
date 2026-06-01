"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * SpotlightCard — a soft radial glow follows the cursor across the card.
 * Updates CSS variables via ref (no React re-render).
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={cn(
        "group/spotlight relative overflow-hidden",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spotlight:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(43,136,168,0.10), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}
