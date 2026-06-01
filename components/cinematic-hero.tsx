"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * CinematicHero
 * Full-screen layered scene of a home that transforms from "before" to "after".
 *  - Background sky/light brightens
 *  - Sunlight bloom appears in windows
 *  - Dust particles drift up and disappear
 *  - Mirror & countertop receive a polishing shine sweep
 *  - Floor gets a subtle "vacuum" sweep
 * The animation loops on a 14s cycle. Pointer parallax adds depth.
 */
export function CinematicHero() {
  const reduceMotion = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const [phase, setPhase] = useState<"before" | "after">("before");

  // Loop between "before" and "after" states
  useEffect(() => {
    if (reduceMotion) {
      setPhase("after");
      return;
    }
    let active = true;
    const tick = (state: "before" | "after") => {
      if (!active) return;
      setPhase(state);
      const next = state === "before" ? "after" : "before";
      // Stay 7s in each state, with a 1s overlap blend driven by CSS transitions
      const timer = window.setTimeout(() => tick(next), 7000);
      return () => window.clearTimeout(timer);
    };
    // First flip after 2.5s — let the "before" register before transforming
    const initial = window.setTimeout(() => tick("after"), 2500);
    return () => {
      active = false;
      window.clearTimeout(initial);
    };
  }, [reduceMotion]);

  // Subtle parallax via pointer
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = sceneRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCursor({
        x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
        y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Scroll-tied subtle drift
  const { scrollY } = useScroll();
  const skyY = useTransform(scrollY, [0, 600], [0, 80]);
  const fgY = useTransform(scrollY, [0, 600], [0, -40]);

  const parX = (depth: number) => (cursor.x - 0.5) * depth;
  const parY = (depth: number) => (cursor.y - 0.5) * depth;

  // Dust particles
  const dust = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 60 + Math.random() * 30,
        size: 2 + Math.random() * 4,
        dx: -20 + Math.random() * 40,
        dy: -40 - Math.random() * 60,
        delay: Math.random() * 6,
        dur: 5 + Math.random() * 4,
      })),
    []
  );

  return (
    <div
      ref={sceneRef}
      data-phase={phase}
      className="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden bg-gradient-to-b from-[#eef3f7] via-[#e9eef2] to-[#dfe5ea]"
    >
      {/* ---------- SKY / LIGHT ---------- */}
      <motion.div
        style={{ y: skyY }}
        className="absolute inset-0 transition-[opacity,background] duration-[2500ms] ease-out"
      >
        <div
          className="absolute inset-0 transition-opacity duration-[2200ms]"
          style={{
            opacity: phase === "after" ? 1 : 0.55,
            background:
              "radial-gradient(120% 80% at 78% 12%, rgba(255,236,189,0.65), transparent 60%), radial-gradient(80% 60% at 22% 18%, rgba(174,214,231,0.55), transparent 70%)",
          }}
        />
        {/* Subtle film grain overlay (CSS only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1.2px)",
            backgroundSize: "3px 3px",
          }}
        />
      </motion.div>

      {/* ---------- ROOM (SVG illustration) ---------- */}
      <motion.div
        style={{ y: fgY, x: parX(-8), translateY: parY(-6) }}
        className="absolute inset-0 grid place-items-end"
      >
        <RoomSVG phase={phase} />
      </motion.div>

      {/* ---------- DUST PARTICLES (before phase) ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: phase === "before" ? 0.9 : 0 }}
      >
        {dust.map((d) => (
          <span
            key={d.id}
            className="absolute rounded-full bg-[#8a857c]"
            style={
              {
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: d.size,
                height: d.size,
                opacity: 0,
                filter: "blur(0.6px)",
                animation: `drift ${d.dur}s var(--ease-soft) ${d.delay}s infinite`,
                "--dx": `${d.dx}px`,
                "--dy": `${d.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* ---------- VACUUM SWEEP on floor (after phase) ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] overflow-hidden"
      >
        <div
          className="absolute inset-y-0 -left-1/3 w-1/2 transition-opacity duration-700"
          style={{
            opacity: phase === "after" ? 0.55 : 0.18,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
            animation: "sweep 6s var(--ease-soft) infinite",
            mixBlendMode: "screen",
          }}
        />
      </div>

      {/* ---------- HERO CONTENT ---------- */}
      <div className="container-tight relative z-10 flex h-full flex-col justify-end pb-12 sm:pb-16 md:justify-center md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone/70 bg-background/70 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-graphite shadow-soft backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-[lightUp_2.4s_ease-in-out_infinite]" />
            Booking openings this week
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-charcoal sm:text-5xl md:text-6xl lg:text-7xl">
            A cleaner home.{" "}
            <span className="block bg-gradient-to-r from-brand-700 via-brand-500 to-accent bg-clip-text text-transparent">
              A clearer mind.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-graphite md:text-lg">
            ClearNest delivers detail-obsessed residential, deep, move-out, and
            Airbnb turnover cleaning across Salt Lake County. Book online in 60 seconds —
            pay after the clean is complete.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="/book"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-charcoal px-6 py-3.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700"
            >
              <span className="relative z-10">Book Cleaning</span>
              <svg viewBox="0 0 24 24" className="relative z-10 h-4 w-4">
                <path
                  fill="currentColor"
                  d="M13.3 5.3a1 1 0 0 1 1.4 0l5.5 5.5a1 1 0 0 1 0 1.4l-5.5 5.5a1 1 0 1 1-1.4-1.4l3.8-3.8H4a1 1 0 1 1 0-2h13.1l-3.8-3.8a1 1 0 0 1 0-1.4Z"
                />
              </svg>
              <span className="shine-bar" />
            </a>
            <a
              href="tel:+18014410726"
              className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background/80 px-5 py-3.5 text-sm font-medium text-charcoal backdrop-blur transition hover:border-brand-300 hover:text-brand-700"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.5 11.5 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A18 18 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.5 11.5 0 0 0 .58 3.6 1 1 0 0 1-.25 1L6.6 10.8Z"
                />
              </svg>
              (801) 441-0726
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-graphite">
            <Trust label="Insured & bonded" />
            <Trust label="Pay after service" />
            <Trust label="Same-day rescheduling" />
            <Trust label="Locally owned · Utah" />
          </div>
        </motion.div>
      </div>

      {/* Top fade for nav legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-32 bg-gradient-to-b from-background/80 to-transparent" />
      {/* Bottom fade so content underneath transitions cleanly */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-brand-600">
        <path
          fill="currentColor"
          d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm3.7 6.2-4.4 4.4a1 1 0 0 1-1.4 0L5.8 9.9a1 1 0 0 1 1.4-1.4l1.4 1.4 3.7-3.7a1 1 0 0 1 1.4 1.4Z"
        />
      </svg>
      {label}
    </span>
  );
}

/**
 * RoomSVG — hand-built three-room cutaway scene.
 * "phase" toggles dirty vs. clean layers via opacity transitions on path groups.
 */
function RoomSVG({ phase }: { phase: "before" | "after" }) {
  const clean = phase === "after";
  return (
    <svg
      viewBox="0 0 1600 900"
      className="h-[78%] w-full max-w-none translate-y-2 select-none"
      aria-hidden
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8cdb9" />
          <stop offset="1" stopColor="#b29e7e" />
        </linearGradient>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4eee2" />
          <stop offset="1" stopColor="#e5dcc8" />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3d3" />
          <stop offset="1" stopColor="#cfe5ef" />
        </linearGradient>
        <linearGradient id="counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e6df" />
          <stop offset="1" stopColor="#c9c3b6" />
        </linearGradient>
        <linearGradient id="mirror" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe2ea" />
          <stop offset="1" stopColor="#a8c6d6" />
        </linearGradient>
        <radialGradient id="bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff4cf" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff4cf" stopOpacity="0" />
        </radialGradient>
        <pattern id="grime" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="8" r="3" fill="#8a8071" opacity="0.18" />
          <circle cx="22" cy="20" r="2.4" fill="#8a8071" opacity="0.16" />
          <circle cx="29" cy="6" r="1.6" fill="#8a8071" opacity="0.14" />
        </pattern>
        <clipPath id="counterClip">
          <rect x="580" y="500" width="460" height="30" />
        </clipPath>
        <clipPath id="mirrorClip">
          <rect x="1120" y="240" width="220" height="160" rx="6" />
        </clipPath>
      </defs>

      {/* WALLS */}
      <rect x="0" y="120" width="1600" height="560" fill="url(#wall)" />
      <rect x="0" y="680" width="1600" height="220" fill="url(#floor)" />

      {/* Room divider walls */}
      <rect x="540" y="180" width="6" height="500" fill="#cdbf9f" opacity="0.6" />
      <rect x="1080" y="180" width="6" height="500" fill="#cdbf9f" opacity="0.6" />

      {/* ----- LEFT ROOM (Living) ----- */}
      <g>
        {/* Window */}
        <rect x="60" y="220" width="380" height="240" fill="#1b3344" />
        <rect x="76" y="236" width="172" height="208" fill="url(#sky)" />
        <rect x="252" y="236" width="172" height="208" fill="url(#sky)" />
        <rect x="60" y="340" width="380" height="6" fill="#1b3344" />
        <rect x="244" y="220" width="6" height="240" fill="#1b3344" />
        {/* Sunlight bloom (clean) */}
        <g style={{ opacity: clean ? 1 : 0.3, transition: "opacity 1.6s ease" }}>
          <ellipse cx="250" cy="340" rx="320" ry="170" fill="url(#bloom)" />
        </g>
        {/* Sofa */}
        <rect x="80" y="540" width="380" height="110" rx="14" fill="#8aa1a6" />
        <rect x="100" y="520" width="120" height="44" rx="10" fill="#9fb3b8" />
        <rect x="240" y="520" width="120" height="44" rx="10" fill="#9fb3b8" />
        {/* Coffee table */}
        <rect x="180" y="660" width="180" height="14" rx="3" fill="#6b5a47" />
        <rect x="190" y="674" width="6" height="22" fill="#6b5a47" />
        <rect x="344" y="674" width="6" height="22" fill="#6b5a47" />
        {/* Picture frame */}
        <rect x="120" y="240" width="60" height="80" fill="#b3a087" />
        <rect x="128" y="248" width="44" height="64" fill="#eadfc6" />
        {/* DIRTY: grime overlay on sofa + floor patch */}
        <g style={{ opacity: clean ? 0 : 1, transition: "opacity 1.4s ease" }}>
          <rect x="80" y="540" width="380" height="110" rx="14" fill="url(#grime)" />
          <ellipse cx="270" cy="780" rx="180" ry="22" fill="#7a6a52" opacity="0.18" />
        </g>
        {/* CLEAN: subtle floor shine */}
        <g style={{ opacity: clean ? 1 : 0, transition: "opacity 1.4s ease" }}>
          <ellipse cx="270" cy="770" rx="220" ry="14" fill="#fff" opacity="0.18" />
        </g>
      </g>

      {/* ----- CENTER ROOM (Kitchen) ----- */}
      <g>
        {/* Upper cabinets */}
        <rect x="580" y="220" width="460" height="110" rx="6" fill="#e8dec8" stroke="#bca982" />
        <line x1="700" y1="220" x2="700" y2="330" stroke="#bca982" />
        <line x1="820" y1="220" x2="820" y2="330" stroke="#bca982" />
        <line x1="940" y1="220" x2="940" y2="330" stroke="#bca982" />
        {/* Counter */}
        <rect x="580" y="500" width="460" height="30" fill="url(#counter)" />
        {/* Lower cabinets */}
        <rect x="580" y="530" width="460" height="170" fill="#dccaa7" stroke="#a98f64" />
        <line x1="700" y1="530" x2="700" y2="700" stroke="#a98f64" />
        <line x1="820" y1="530" x2="820" y2="700" stroke="#a98f64" />
        <line x1="940" y1="530" x2="940" y2="700" stroke="#a98f64" />
        {/* Sink */}
        <rect x="720" y="470" width="160" height="40" rx="6" fill="#c7cdd1" />
        <circle cx="800" cy="460" r="4" fill="#9aa3a9" />
        <rect x="797" y="430" width="6" height="34" fill="#9aa3a9" />
        {/* Range */}
        <rect x="900" y="540" width="120" height="120" fill="#3a3f44" />
        <circle cx="930" cy="570" r="10" fill="#1c2024" />
        <circle cx="990" cy="570" r="10" fill="#1c2024" />
        <circle cx="930" cy="620" r="10" fill="#1c2024" />
        <circle cx="990" cy="620" r="10" fill="#1c2024" />
        {/* Pendant lights */}
        <line x1="660" y1="220" x2="660" y2="280" stroke="#a98f64" />
        <line x1="960" y1="220" x2="960" y2="280" stroke="#a98f64" />
        <circle cx="660" cy="290" r="10" fill={clean ? "#fff4c8" : "#c9c0a9"} style={{ transition: "fill 1.4s ease" }} />
        <circle cx="960" cy="290" r="10" fill={clean ? "#fff4c8" : "#c9c0a9"} style={{ transition: "fill 1.4s ease" }} />

        {/* DIRTY: grime overlay on counter */}
        <g style={{ opacity: clean ? 0 : 1, transition: "opacity 1.4s ease" }}>
          <rect x="580" y="500" width="460" height="30" fill="url(#grime)" />
          <ellipse cx="800" cy="540" rx="60" ry="8" fill="#6b5a47" opacity="0.18" />
        </g>
        {/* CLEAN: counter shine sweep */}
        <g style={{ opacity: clean ? 1 : 0, transition: "opacity 1.0s ease" }}>
          <rect x="580" y="500" width="460" height="30" fill="url(#counter)" />
          <g clipPath="url(#counterClip)">
            <rect
              x="540"
              y="498"
              width="120"
              height="34"
              fill="white"
              opacity="0.45"
              style={{
                animation: "sweep 4.2s var(--ease-soft) infinite",
                transformBox: "view-box",
              }}
            />
          </g>
        </g>
      </g>

      {/* ----- RIGHT ROOM (Bathroom) ----- */}
      <g>
        {/* Mirror */}
        <rect x="1120" y="240" width="220" height="160" rx="6" fill="url(#mirror)" stroke="#8aa2ae" />
        {/* Vanity */}
        <rect x="1100" y="500" width="260" height="200" fill="#dccaa7" stroke="#a98f64" />
        <rect x="1100" y="500" width="260" height="20" fill="url(#counter)" />
        <rect x="1180" y="540" width="100" height="40" rx="6" fill="#c7cdd1" />
        <rect x="1227" y="510" width="6" height="36" fill="#9aa3a9" />
        {/* Towels */}
        <rect x="1380" y="460" width="40" height="80" fill={clean ? "#eef5f9" : "#c5bca9"} style={{ transition: "fill 1.4s ease" }} />
        <rect x="1428" y="460" width="40" height="80" fill={clean ? "#dde9f0" : "#aea58f"} style={{ transition: "fill 1.4s ease" }} />
        {/* Tub */}
        <rect x="1380" y="600" width="200" height="100" rx="12" fill="#cfd6db" />
        <rect x="1396" y="612" width="168" height="76" rx="10" fill="#eaf0f3" />

        {/* DIRTY mirror smudges */}
        <g style={{ opacity: clean ? 0 : 1, transition: "opacity 1.4s ease" }}>
          <rect x="1120" y="240" width="220" height="160" rx="6" fill="url(#grime)" />
          <ellipse cx="1230" cy="320" rx="60" ry="20" fill="#6b5a47" opacity="0.15" />
        </g>
        {/* CLEAN mirror shine sweep */}
        <g style={{ opacity: clean ? 1 : 0, transition: "opacity 1s ease" }}>
          <rect x="1120" y="240" width="220" height="160" rx="6" fill="url(#mirror)" />
          <g clipPath="url(#mirrorClip)">
            <rect
              x="1080"
              y="238"
              width="120"
              height="166"
              fill="white"
              opacity="0.5"
              style={{
                animation: "sweep 3.4s var(--ease-soft) infinite",
                transformBox: "view-box",
              }}
            />
          </g>
        </g>
      </g>

      {/* Baseboard line */}
      <rect x="0" y="676" width="1600" height="4" fill="#a98f64" opacity="0.5" />
    </svg>
  );
}
