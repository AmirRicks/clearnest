"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedText } from "@/components/anim/animated-text";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-28", className)}>
      <div className="container-tight">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const cls =
    "inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite";
  if (reduce) {
    return (
      <span className={cls}>
        <span className="h-1 w-1 rounded-full bg-brand-500" />
        {children}
      </span>
    );
  }
  return (
    <motion.span
      className={cls}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <span className="h-1 w-1 rounded-full bg-brand-500 motion-safe:animate-[lightUp_2.4s_ease-in-out_infinite]" />
      {children}
    </motion.span>
  );
}

export function H2({
  children,
  className,
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}) {
  const base =
    "mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-charcoal sm:text-4xl md:text-5xl";
  // Animate word-by-word only when given a plain string.
  if (animate && typeof children === "string") {
    return <AnimatedText as="h2" text={children} className={cn(base, className)} />;
  }
  return <h2 className={cn(base, className)}>{children}</h2>;
}

export function Lead({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const cls = cn(
    "mt-5 max-w-2xl text-pretty text-base leading-relaxed text-graphite md:text-lg",
    className
  );
  if (reduce) return <p className={cls}>{children}</p>;
  return (
    <motion.p
      className={cls}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
    >
      {children}
    </motion.p>
  );
}
