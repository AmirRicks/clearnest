"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * AnimatedText — splits a string into words and reveals them with a
 * staggered blur + slide-up. Renders the requested semantic tag.
 */
export function AnimatedText({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    const Tag = as as React.ElementType;
    return <Tag className={className}>{text}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.span;
  const containerClass = as === "span" ? cn("inline-block", className) : className;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: "0em",
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: EASE },
    },
  };

  return (
    <MotionTag
      className={containerClass}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block" variants={word}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/** Gradient sheen text — pure CSS, very cheap. */
export function ShinyText({
  children,
  className,
  light = false,
}: {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={cn(light ? "shiny-text-light" : "shiny-text", className)}>{children}</span>
  );
}
