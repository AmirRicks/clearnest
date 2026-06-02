import { cn } from "@/lib/utils";

/**
 * ClearNest brand mark.
 *
 * Concept: a single geometric silhouette fusing two ideas into one form —
 *   • peaked roof   → the home
 *   • curved cradle → the nest (welcome, comfort, care)
 *   • gold dot      → "Clear" — the spark of a freshly cleaned home
 *
 * The outline uses `currentColor` so the surrounding parent controls the
 * brand color (works dark-on-light, white-on-dark, monochrome print, etc.).
 * The accent dot is the only baked-in color (brand gold #c9a96e) and is
 * what makes the mark instantly readable as "ClearNest" instead of
 * "generic house icon."
 *
 * Scales perfectly: 16px favicon → billboard.
 */
export function LogoMark({
  className,
  accent = true,
  filled = false,
  title = "ClearNest",
}: {
  className?: string;
  /** Show the gold "spark" inside the cradle. Default true. */
  accent?: boolean;
  /** Solid filled silhouette instead of outlined. Use for small sizes (≤16px) and favicon. */
  filled?: boolean;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={cn("inline-block", className)}
      fill="none"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* The home-nest silhouette: peaked roof above a curved cradle */}
      <path
        d="M8 32 L32 8 L56 32 Q56 60 32 60 Q8 60 8 32 Z"
        stroke={filled ? "none" : "currentColor"}
        strokeWidth="4.5"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
      {/* Gold spark — the "Clear" in ClearNest */}
      {accent && <circle cx="32" cy="38" r="3" fill="#c9a96e" />}
    </svg>
  );
}
