"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Pair = {
  id: string;
  label: string;
  category: string;
};

const DEFAULT_PAIRS: Pair[] = [
  { id: "kitchen-01", label: "Kitchen — deep clean", category: "Kitchen" },
  { id: "bathroom-01", label: "Master bath — restoration", category: "Bathroom" },
  { id: "living-01", label: "Living room — recurring", category: "Living" },
  { id: "airbnb-01", label: "Airbnb turnover — same-day", category: "Airbnb" },
];

export function BeforeAfter({
  pair = DEFAULT_PAIRS[0],
}: {
  pair?: Pair;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pct, setPct] = useState(48);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onUp = () => setDragging(false);
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, []);

  const onMove = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
    setPct(p);
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={(e) => {
        setDragging(true);
        onMove(e.clientX);
      }}
      onPointerMove={(e) => dragging && onMove(e.clientX)}
      className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-3xl border border-stone/70 bg-paper shadow-card"
    >
      {/* AFTER (clean) layer */}
      <SyntheticRoom variant="after" category={pair.category} />
      {/* BEFORE (dirty) layer, masked by pct */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <SyntheticRoom variant="before" category={pair.category} />
      </div>

      {/* Handle */}
      <div
        className="absolute inset-y-0 z-10 flex w-px items-center justify-center bg-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.05)]"
        style={{ left: `calc(${pct}% - 0.5px)` }}
      >
        <button
          type="button"
          aria-label="Drag to reveal"
          onPointerDown={(e) => {
            e.stopPropagation();
            setDragging(true);
          }}
          className="grid h-10 w-10 -translate-x-0 cursor-grab place-items-center rounded-full border border-stone/70 bg-background shadow-card active:cursor-grabbing"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-graphite">
            <path d="M9 6l-4 6 4 6M15 6l4 6-4 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Labels */}
      <span className="absolute left-3 top-3 rounded-full bg-charcoal/85 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
        Before
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-success/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">
        After
      </span>
      <motion.span
        initial={{ y: 6, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="absolute bottom-3 left-3 rounded-full border border-stone/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-graphite backdrop-blur"
      >
        {pair.label}
      </motion.span>
    </div>
  );
}

/**
 * Synthetic, hand-drawn-looking SVG room — varies by category, so we don't have to ship
 * stock imagery. Looks deliberate and unique.
 */
function SyntheticRoom({
  variant,
  category,
}: {
  variant: "before" | "after";
  category: string;
}) {
  const dirty = variant === "before";
  const wall = dirty ? "#e5dcc8" : "#f5eedf";
  const floor = dirty ? "#a89072" : "#d9c8a4";
  const accent = dirty ? "#7a6852" : "#caa874";

  return (
    <svg viewBox="0 0 600 450" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="600" height="450" fill={wall} />
      <rect y="320" width="600" height="130" fill={floor} />
      {/* Baseboard */}
      <rect y="318" width="600" height="3" fill={accent} opacity="0.6" />

      {category === "Kitchen" && <Kitchen dirty={dirty} accent={accent} />}
      {category === "Bathroom" && <Bathroom dirty={dirty} accent={accent} />}
      {category === "Living" && <Living dirty={dirty} accent={accent} />}
      {category === "Airbnb" && <Airbnb dirty={dirty} accent={accent} />}

      {/* Lighting */}
      <defs>
        <radialGradient id="lightAfter" cx="50%" cy="20%" r="70%">
          <stop offset="0" stopColor="#fff4cf" stopOpacity={dirty ? 0.15 : 0.6} />
          <stop offset="1" stopColor="#fff4cf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="450" fill="url(#lightAfter)" />
      {dirty && (
        <g opacity="0.18">
          <circle cx="120" cy="380" r="40" fill="#5a4a36" />
          <circle cx="280" cy="400" r="26" fill="#5a4a36" />
          <circle cx="430" cy="370" r="50" fill="#5a4a36" />
        </g>
      )}
    </svg>
  );
}

function Kitchen({ dirty, accent }: { dirty: boolean; accent: string }) {
  return (
    <g>
      <rect x="40" y="80" width="520" height="80" rx="6" fill="#ece2c9" stroke={accent} />
      <line x1="180" y1="80" x2="180" y2="160" stroke={accent} />
      <line x1="320" y1="80" x2="320" y2="160" stroke={accent} />
      <line x1="450" y1="80" x2="450" y2="160" stroke={accent} />
      <rect x="40" y="240" width="520" height="20" fill="#d6cdb6" />
      <rect x="40" y="260" width="520" height="60" fill="#e0cfa5" stroke={accent} />
      <rect x="240" y="216" width="120" height="28" rx="4" fill="#b8bec3" />
      {dirty && (
        <>
          <ellipse cx="300" cy="250" rx="80" ry="6" fill="#6b5a47" opacity="0.25" />
          <ellipse cx="120" cy="250" rx="40" ry="4" fill="#6b5a47" opacity="0.2" />
        </>
      )}
    </g>
  );
}

function Bathroom({ dirty, accent }: { dirty: boolean; accent: string }) {
  return (
    <g>
      <rect x="80" y="70" width="200" height="140" rx="8" fill="#cee0e8" stroke={accent} />
      <rect x="60" y="240" width="260" height="20" fill="#d6cdb6" />
      <rect x="60" y="260" width="260" height="60" fill="#e0cfa5" stroke={accent} />
      <rect x="140" y="266" width="100" height="34" rx="6" fill="#b8bec3" />
      <rect x="370" y="200" width="180" height="120" rx="14" fill="#dfe4e8" />
      <rect x="384" y="212" width="152" height="96" rx="10" fill="#f1f5f7" />
      {dirty && (
        <>
          <rect x="80" y="70" width="200" height="140" rx="8" fill="#6b5a47" opacity="0.12" />
          <ellipse cx="200" cy="140" rx="60" ry="20" fill="#5a4a36" opacity="0.15" />
        </>
      )}
    </g>
  );
}

function Living({ dirty, accent }: { dirty: boolean; accent: string }) {
  return (
    <g>
      <rect x="40" y="60" width="220" height="140" fill="#19384a" />
      <rect x="50" y="70" width="98" height="120" fill="#bcdde9" />
      <rect x="158" y="70" width="98" height="120" fill="#bcdde9" />
      <rect x="60" y="240" width="320" height="80" rx="10" fill="#8aa1a6" />
      <rect x="76" y="226" width="90" height="22" rx="6" fill="#9fb3b8" />
      <rect x="190" y="226" width="90" height="22" rx="6" fill="#9fb3b8" />
      <rect x="420" y="240" width="120" height="14" fill="#6b5a47" />
      <rect x="428" y="254" width="6" height="18" fill="#6b5a47" />
      <rect x="528" y="254" width="6" height="18" fill="#6b5a47" />
      {dirty && (
        <>
          <ellipse cx="220" cy="320" rx="120" ry="10" fill="#5a4a36" opacity="0.2" />
          <ellipse cx="200" cy="285" rx="80" ry="6" fill="#6b5a47" opacity="0.2" />
        </>
      )}
    </g>
  );
}

function Airbnb({ dirty, accent }: { dirty: boolean; accent: string }) {
  return (
    <g>
      {/* Bed */}
      <rect x="80" y="190" width="380" height="120" rx="10" fill="#e7decb" stroke={accent} />
      <rect x="80" y="190" width="380" height="30" fill="#cde2eb" />
      <rect x="100" y="160" width="120" height="34" rx="8" fill="#fff" />
      <rect x="320" y="160" width="120" height="34" rx="8" fill="#fff" />
      <rect x="480" y="220" width="60" height="100" rx="6" fill="#d6cdb6" />
      {dirty && (
        <>
          <path d="M90 220 q60 -30 180 0 t180 0" stroke="#7a6852" strokeWidth="2" fill="none" opacity="0.6" />
          <ellipse cx="270" cy="270" rx="160" ry="6" fill="#5a4a36" opacity="0.18" />
        </>
      )}
    </g>
  );
}
