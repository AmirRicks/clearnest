"use client";

import { useRef } from "react";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { Phone, Leaf, ChevronDown, ShieldCheck, CreditCard } from "lucide-react";
import { BUSINESS } from "@/lib/utils";
import { AnimatedText, ShinyText } from "@/components/anim/animated-text";
import { MagneticButton } from "@/components/anim/magnetic";

/**
 * CinematicHero — full-bleed looping video with a liquid-glass UI, kinetic
 * typography, color grade + grain, and ref-driven parallax (no motion-value
 * style binding, so it's crash-free and smooth).
 */
export function CinematicHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoWrap = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (videoWrap.current)
      videoWrap.current.style.transform = `translate3d(0, ${p * 90}px, 0) scale(${1.06 + p * 0.12})`;
    if (content.current) {
      content.current.style.opacity = String(Math.max(0, 1 - p * 1.5));
      content.current.style.transform = `translate3d(0, ${p * -36}px, 0)`;
    }
    if (hint.current) hint.current.style.opacity = String(Math.max(0, 1 - p * 6));
  });

  return (
    <section
      ref={ref}
      className="grain vignette relative -mt-16 h-[100svh] min-h-[640px] w-full overflow-hidden bg-charcoal md:-mt-20"
    >
      {/* Background video (parallax layer) */}
      <div
        ref={videoWrap}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "scale(1.06)" }}
      >
        {reduce ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/video/home-tour-poster.jpg"
            alt="A freshly cleaned modern home"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/video/home-tour-poster.jpg"
            preload="metadata"
            aria-hidden
          >
            <source src="/video/home-tour.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* Cinematic color grade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/15 to-charcoal/85" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-900/45 via-transparent to-accent/10" />

      {/* Content */}
      <div ref={content} className="relative z-10 flex h-full flex-col justify-center">
        <div className="container-wide">
          <div className="max-w-3xl">
            <span className="glass glass-specular mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-success motion-safe:animate-[lightUp_2.2s_ease-in-out_infinite]" />
              Booking openings this week · Salt Lake County
            </span>

            <h1 className="display-1 text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
              <span className="block">
                <AnimatedText text="A cleaner home." />
              </span>
              <span className="block">
                <ShinyText light>A clearer mind.</ShinyText>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/85 md:text-lg">
              Premium residential, deep, move-out, and Airbnb cleaning — booked online in 60
              seconds. We restore the calm; you pay after the clean.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton href="/book" variant="light">
                Book Cleaning
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M13.3 5.3a1 1 0 0 1 1.4 0l5.5 5.5a1 1 0 0 1 0 1.4l-5.5 5.5a1 1 0 1 1-1.4-1.4l3.8-3.8H4a1 1 0 1 1 0-2h13.1l-3.8-3.8a1 1 0 0 1 0-1.4Z"
                  />
                </svg>
              </MagneticButton>
              <MagneticButton href={BUSINESS.phoneHref} variant="outline">
                <Phone className="h-4 w-4" />
                {BUSINESS.phone}
              </MagneticButton>
            </div>

            {/* Floating liquid-glass trust card */}
            <div className="glass glass-specular mt-10 inline-flex flex-wrap items-center gap-x-7 gap-y-3 rounded-2xl px-5 py-4 text-white">
              <span className="inline-flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-brand-200" /> Insured &amp; bonded
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="inline-flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-brand-200" /> Pay after service
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="inline-flex items-center gap-2 text-sm">
                <Leaf className="h-4 w-4 text-brand-200" /> Eco &amp; pet-safe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        ref={hint}
        className="absolute bottom-6 left-0 right-0 z-10 flex justify-center"
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/75">
          Scroll <ChevronDown className="h-4 w-4 animate-bounce" />
        </span>
      </div>

      {/* Bottom fade into page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}
