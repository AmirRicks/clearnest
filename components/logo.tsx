import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <circle cx="17" cy="8" r="1.6" fill="white" />
          <circle cx="19.5" cy="6" r="0.8" fill="white" opacity="0.7" />
        </svg>
        <span className="absolute inset-0 -z-10 rounded-xl bg-white opacity-0 blur-md transition group-hover:opacity-50" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-tight text-charcoal">
            ClearNest
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-graphite/70">
            Cleaning Services
          </span>
        </span>
      )}
    </Link>
  );
}
