"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { Phone, ChevronDown } from "lucide-react";
import { TOUR_ROOMS } from "@/lib/tour-data";
import { BUSINESS } from "@/lib/utils";
import { AnimatedText, ShinyText } from "@/components/anim/animated-text";
import { MagneticButton } from "@/components/anim/magnetic";

const N = TOUR_ROOMS.length;

export function HouseTour() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);
  // Update the active-room label only when the integer index changes (cheap).
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(N - 1, Math.max(0, Math.floor(p * N + 0.001)));
    setActive((cur) => (cur === idx ? cur : idx));
  });

  // Headline fades as we leave the first room.
  const headlineOpacity = useTransform(scrollYProgress, [0, 1 / (N * 1.3)], [1, 0]);
  const headlineY = useTransform(scrollYProgress, [0, 1 / (N * 1.3)], [0, -40]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  if (reduce) return <StaticHero />;

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `${N * 92}svh` }}
      aria-label="Tour of a freshly cleaned home"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-charcoal">
        {/* Stacked room images */}
        {TOUR_ROOMS.map((room, i) => (
          <Room key={room.src} index={i} progress={scrollYProgress} />
        ))}

        {/* Legibility scrims */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-charcoal/55 via-transparent to-charcoal/70" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-charcoal/60 to-transparent" />

        {/* Headline (first room) */}
        <motion.div
          style={{ opacity: headlineOpacity, y: headlineY }}
          className="absolute inset-0 z-30 flex items-center"
        >
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
        </motion.div>

        {/* Per-room captions (room 0 shows the headline instead) */}
        {TOUR_ROOMS.map((room, i) =>
          i === 0 ? null : (
            <RoomCaption key={`cap-${room.src}`} index={i} progress={scrollYProgress} room={room} />
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

        {/* Room counter */}
        <div className="absolute bottom-6 left-0 right-0 z-40">
          <div className="container-tight flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
              Room {active + 1} / {N} · {TOUR_ROOMS[active].label}
            </span>
            <motion.span
              style={{ opacity: hintOpacity }}
              className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/80"
            >
              Scroll to tour <ChevronDown className="h-4 w-4 animate-bounce" />
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Room — one full-bleed interior. Cross-fades + Ken Burns zoom, and transitions
 * from a "dusty before" (desaturated, dim) to "bright after" (vivid) as it centers,
 * evoking the clean.
 */
function Room({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const room = TOUR_ROOMS[index];
  const start = index / N;
  const end = (index + 1) / N;
  const pad = 0.5 / N; // cross-fade overlap

  const first = index === 0;
  const last = index === N - 1;

  const opacity = useTransform(
    progress,
    [start - pad, start, end - pad, end],
    [first ? 1 : 0, 1, 1, last ? 1 : 0]
  );
  const scale = useTransform(progress, [start - pad, end], [1.16, 1.02]);
  const x = useTransform(progress, [start - pad, end], ["3%", "-3%"]);
  // before -> after: desaturated/dim at entry, vivid/bright as it centers
  const filter = useTransform(
    progress,
    [start - pad, start + pad / 2],
    ["saturate(0.55) brightness(0.82)", "saturate(1.06) brightness(1)"]
  );

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 z-10">
      <motion.div style={{ scale, x, filter }} className="relative h-full w-full gpu">
        <Image
          src={room.src}
          alt={room.label}
          fill
          priority={first}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={room.blur}
          className="object-cover"
        />
      </motion.div>
      {/* shine sweep evoking a fresh-cleaned surface */}
      <span className="shine-bar z-10 opacity-60" />
    </motion.div>
  );
}

function RoomCaption({
  index,
  progress,
  room,
}: {
  index: number;
  progress: MotionValue<number>;
  room: (typeof TOUR_ROOMS)[number];
}) {
  const start = index / N;
  const end = (index + 1) / N;
  const pad = 0.4 / N;
  const opacity = useTransform(
    progress,
    [start - pad, start + pad, end - pad, end],
    [0, 1, 1, index === N - 1 ? 1 : 0]
  );
  const y = useTransform(progress, [start - pad, start + pad], [30, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-24 z-30 md:bottom-28"
    >
      <div className="container-tight">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
          {room.label}
        </span>
        <p className="mt-2 max-w-md text-balance text-2xl font-semibold leading-tight text-white drop-shadow-sm sm:text-3xl">
          {room.caption}
        </p>
      </div>
    </motion.div>
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
