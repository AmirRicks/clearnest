import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

/**
 * ClearNest logo lockup: the geometric mark + a confident wordmark.
 * - Mark uses currentColor (set to brand teal by the parent)
 * - Wordmark: Geist Sans 600, tight tracking — modern, no clichés
 * - Tagline strap reads "Cleaning Services" in micro-tracked uppercase
 */
export function Logo({
  className,
  compact = false,
  href = "/",
}: {
  className?: string;
  compact?: boolean;
  href?: string | null;
}) {
  const inner = (
    <>
      <span className="grid h-9 w-9 place-items-center text-brand-700 transition-transform duration-300 group-hover:-rotate-3">
        <LogoMark className="h-9 w-9" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-semibold tracking-[-0.01em] text-charcoal">
            ClearNest
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-graphite/70">
            Cleaning Services
          </span>
        </span>
      )}
    </>
  );

  if (href === null) {
    return (
      <span className={cn("group inline-flex items-center gap-2.5", className)}>
        {inner}
      </span>
    );
  }
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      {inner}
    </Link>
  );
}
