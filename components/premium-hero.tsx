import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { BUSINESS } from "@/lib/utils";
import { MagneticButton } from "@/components/anim/magnetic";

// Generated from public/hero/living-room.jpg (Pexels 5998120, free license).
const HERO_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6q8Ha3oup3+rjxJavpVjpMzpFc53C5jGNsq9RjJxXtF/4n+HH/CLX1tFrMJMmnyCFLjZC73CuAMA4JJXP9K+JyTN4HYSneNij5ueMZxz714t8U55glgwkYFIZMHJyNqHGPp2r5yrmPLHSKOynheZ6s//Z";

/** Server component — the hero renders as static HTML and the entrance runs via
 *  CSS (see .cn-reveal / .cn-reveal-solid in globals.css), so the LCP headline
 *  is visible on first paint with no JS dependency. Staggered with --cn-delay. */
function delay(seconds: number): CSSProperties {
  return { "--cn-delay": `${seconds}s` } as CSSProperties;
}

export function PremiumHero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Soft, calm ambient wash — premium without clutter */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-gradient-to-b from-brand-50/70 via-background to-background" />
      <div className="pointer-events-none absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-44 top-44 h-[26rem] w-[26rem] rounded-full bg-brand-200/25 blur-3xl" />

      <div className="container-tight relative">
        {/* Centered headline block — single bold headline, extreme white space */}
        <div className="mx-auto max-w-3xl pt-16 text-center md:pt-24">
          <span
            style={delay(0)}
            className="cn-reveal inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/70 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.16em] text-graphite backdrop-blur"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            Insured &amp; bonded · Salt Lake County
          </span>

          {/* Solid reveal (no opacity fade) so the LCP headline paints at once */}
          <h1 style={delay(0.04)} className="cn-reveal-solid mt-7 text-balance display-1 text-charcoal">
            A cleaner home.
            <span className="block text-brand-700">A clearer mind.</span>
          </h1>

          <p
            style={delay(0.14)}
            className="cn-reveal mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-graphite md:text-xl"
          >
            Premium residential, deep, move-out &amp; Airbnb cleaning. Book in 60 seconds — and
            pay after the clean, never before.
          </p>

          <div style={delay(0.22)} className="cn-reveal mt-9 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton href="/book" variant="dark">
              Book a cleaning
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="/#estimator" variant="outline">
              Get a free quote
            </MagneticButton>
          </div>

          <p style={delay(0.3)} className="cn-reveal mt-6 text-sm text-graphite/80">
            No deposit · Same-day reschedule ·{" "}
            <a href={BUSINESS.phoneHref} className="font-medium text-brand-700 hover:text-brand-800">
              {BUSINESS.phone}
            </a>
          </p>
        </div>

        {/* The "product shot": a stunning, sun-drenched, immaculate room (the result).
            Solid reveal keeps the blur placeholder painted immediately for LCP. */}
        <div style={delay(0.16)} className="cn-reveal-solid relative mx-auto mt-16 max-w-6xl md:mt-20">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-stone/50 shadow-[0_40px_90px_-32px_rgb(20_31_43/0.40)] md:rounded-[2rem]">
            <Image
              src="/hero/living-room.jpg"
              alt="A bright, sun-drenched living room freshly cleaned by ClearNest"
              width={2200}
              height={1466}
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              placeholder="blur"
              blurDataURL={HERO_BLUR}
              className="h-auto w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-charcoal/25 to-transparent" />
            {/* One restrained "peak" detail — craftsmanship without clutter */}
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-charcoal shadow-lg backdrop-blur md:bottom-6 md:left-6">
              <span className="h-2 w-2 rounded-full bg-success" />
              Pay after the clean
            </div>
          </div>
        </div>
      </div>

      <div className="h-16 md:h-24" />
    </section>
  );
}
