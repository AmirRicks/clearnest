"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { Phone, ChevronDown } from "lucide-react";
import { TOUR_ROOMS } from "@/lib/tour-data";
import { BUSINESS } from "@/lib/utils";
import { AnimatedText, ShinyText } from "@/components/anim/animated-text";
import { MagneticButton } from "@/components/anim/magnetic";

const N = TOUR_ROOMS.length;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * HouseTour — scroll-scrubbed walk-through of real interiors.
 * Everything is driven imperatively from a single scroll subscription writing
 * directly to refs (no motion-value -> style binding), which keeps it crash-free
 * and buttery smooth.
 */
export function HouseTour() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);

  const roomRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const apply = (p: number) => {
    const half = 1 / N;
    const idx = Math.min(N - 1, Math.max(0, Math.floor(p * N + 0.0001)));
    setActive((c) => (c === idx ? c : idx));

    for (let i = 0; i < N; i++) {
      const center = (i + 0.5) / N;
      const dist = Math.abs(p - center) / half;

      // Cross-fade (triangular peak at center)
      let o = 1 - clamp01(dist);
      if (i === 0 && p < center) o = 1;
      if (i === N - 1 && p > center) o = 1;

      const room = roomRefs.current[i];
      if (room) room.style.opacity = String(clamp01(o));

      // Ken Burns zoom + parallax pan across the room's window
      const t = clamp01((p - (center - half)) / (2 * half));
      const img = imgRefs.current[i];
      if (img) {
        img.style.transform = `translate3d(${lerp(22, -22, t)}px,0,0) scale(${lerp(
          1.14,
          1.0,
          t
        )})`;
      }

      // Dusty -> bright: dark scrim is heaviest at edges, clears at center
      const dim = dimRefs.current[i];
      if (dim) dim.style.opacity = String(clamp01(dist) * 0.34);

      // Captions ride with their room — sharpened so only the dominant room shows
      if (i > 0) {
        const cap = capRefs.current[i];
        if (cap) {
          const capO = clamp01((o - 0.45) / 0.55);
          cap.style.opacity = String(capO);
          cap.style.transform = `translateY(${lerp(28, 0, capO)}px)`;
        }
      }
    }

    // Headline fades as we leave room 1
    const h = clamp01(p / ((1 / N) * 0.85));
    if (headlineRef.current) {
      headlineRef.current.style.opacity = String(1 - h);
      headlineRef.current.style.transform = `translateY(${lerp(0, -40, h)}px)`;
    }
    if (hintRef.current) hintRef.current.style.opacity = String(1 - clamp01(p / 0.04));
  };

  useMotionValueEvent(scrollYProgress, "change", apply);
  useEffect(() => {
    apply(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduce) return <StaticHero />;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${N * 92}svh` }}
      aria-label="Tour of a freshly cleaned home"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-charcoal">
        {/* Stacked room images */}
        {TOUR_ROOMS.map((room, i) => (
          <div
            key={room.src}
            ref={(el) => {
              roomRefs.current[i] = el;
            }}
            className="absolute inset-0 z-10"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <div
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              className="relative h-full w-full gpu"
            >
              <Image
                src={room.src}
                alt={room.label}
                fill
                priority={i === 0}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={room.blur}
                className="object-cover"
              />
            </div>
            <div
              ref={(el) => {
                dimRefs.current[i] = el;
              }}
              className="absolute inset-0 bg-charcoal"
              style={{ opacity: 0.5 }}
            />
            <span className="shine-bar z-10 opacity-60" />
          </div>
        ))}

        {/* Legibility scrims — light enough to keep the rooms bright */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal/65" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-charcoal/45 to-transparent" />

        {/* Headline (room 1) */}
        <div ref={headlineRef} className="absolute inset-0 z-30 flex items-center">
          <div className="container-tight">
            <div className="max-w-2xl">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Booking openings this week
              </span>
              <h1 className="text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl">
                <AnimatedText text="A cleaner home." />
                <span className="mt-1 block">
                  <ShinyText light>A clearer mind.</ShinyText>
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/85 md:text-lg">
                Scroll to tour a home we just restored — room by room. Residential, deep,
                move-out, and Airbnb cleaning across Salt Lake County. Book in 60 seconds, pay
                after the clean.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
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
            </div>
          </div>
        </div>

        {/* Per-room captions */}
        {TOUR_ROOMS.map((room, i) =>
          i === 0 ? null : (
            <div
              key={`cap-${room.src}`}
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              className="absolute inset-x-0 bottom-24 z-30 md:bottom-28"
              style={{ opacity: 0 }}
            >
              <div className="container-tight">
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
                  {room.label}
                </span>
                <p className="mt-2 max-w-md text-balance text-2xl font-semibold leading-tight text-white drop-shadow-sm sm:text-3xl">
                  {room.caption}
                </p>
              </div>
            </div>
          )
        )}

        {/* Progress rail */}
        <div className="absolute right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
          {TOUR_ROOMS.map((room, i) => (
            <div key={`dot-${room.src}`} className="flex items-center gap-2">
              <span
                className={[
                  "text-[10px] font-medium uppercase tracking-[0.14em] transition-all duration-300",
                  active === i ? "text-white opacity-100" : "text-white/0 opacity-0",
                ].join(" ")}
              >
                {room.label}
              </span>
              <span
                className={[
                  "block rounded-full transition-all duration-300",
                  active === i ? "h-6 w-1.5 bg-white" : "h-1.5 w-1.5 bg-white/40",
                ].join(" ")}
              />
            </div>
          ))}
        </div>

        {/* Room counter + scroll hint */}
        <div className="absolute bottom-6 left-0 right-0 z-40">
          <div className="container-tight flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
              Room {active + 1} / {N} · {TOUR_ROOMS[active].label}
            </span>
            <div
              ref={hintRef}
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/80"
            >
              Scroll to tour <ChevronDown className="h-4 w-4 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Reduced-motion fallback: a clean static hero over the first room. */
function StaticHero() {
  const room = TOUR_ROOMS[0];
  return (
    <section className="relative h-[88svh] min-h-[560px] w-full overflow-hidden bg-charcoal">
      <Image
        src={room.src}
        alt={room.label}
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        blurDataURL={room.blur}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-transparent to-charcoal/70" />
      <div className="absolute inset-0 flex items-center">
        <div className="container-tight max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            A cleaner home. A clearer mind.
          </h1>
          <p className="mt-5 max-w-xl text-white/85">
            Residential, deep, move-out, and Airbnb cleaning across Salt Lake County. Book in 60
            seconds, pay after the clean.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-800"
            >
              Book Cleaning
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3.5 text-sm font-medium text-white"
            >
              <Phone className="h-4 w-4" /> {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
