"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Magnetic — element gently follows the cursor while hovered, then springs back.
 * Uses motion values (no React re-renders) so it stays buttery.
 */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  if (reduce) return <div className={className}>{children}</div>;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

type CTAProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "light" | "outline";
  onClick?: () => void;
  shine?: boolean;
};

/**
 * MagneticButton — premium CTA with magnetic pull, shine sweep, and a
 * cursor-spark ripple on click.
 */
export function MagneticButton({
  href,
  children,
  className,
  variant = "dark",
  onClick,
  shine = true,
}: CTAProps) {
  const reduce = useReducedMotion();

  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold transition-colors";
  const variants = {
    dark: "bg-charcoal text-white hover:bg-brand-700 shadow-card",
    light: "bg-white text-brand-800 hover:bg-paper shadow-card",
    outline: "border border-stone/80 bg-background/80 text-charcoal hover:border-brand-300 hover:text-brand-700 backdrop-blur",
  } as const;

  const spark = (e: React.MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const s = document.createElement("span");
    s.className = "pointer-events-none absolute z-0 rounded-full";
    const size = Math.max(r.width, r.height);
    s.style.width = s.style.height = `${size}px`;
    s.style.left = `${e.clientX - r.left - size / 2}px`;
    s.style.top = `${e.clientY - r.top - size / 2}px`;
    s.style.background = "radial-gradient(circle, rgba(255,255,255,0.5), transparent 60%)";
    s.style.transform = "scale(0)";
    s.style.transition = "transform 0.6s ease-out, opacity 0.6s ease-out";
    el.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = "scale(1)";
      s.style.opacity = "0";
    });
    setTimeout(() => s.remove(), 650);
  };

  const inner = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {shine && !reduce && <span className="shine-bar z-0" />}
    </>
  );

  const cls = cn(base, variants[variant], className);

  const content = href ? (
    <a href={href} onClick={(e) => { spark(e); onClick?.(); }} className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={(e) => { spark(e); onClick?.(); }} className={cls}>
      {inner}
    </button>
  );

  if (reduce) return content;
  return <Magnetic strength={0.25}>{content}</Magnetic>;
}
