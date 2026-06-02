"use client";

import { useEffect } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@vercel/analytics";

/**
 * Site-wide analytics:
 *  - Vercel Web Analytics (free on Hobby) — page views + custom conversion events
 *  - Microsoft Clarity (free, unlimited) — heatmaps + session recordings
 *    (only loads when NEXT_PUBLIC_CLARITY_ID is set)
 *  - Auto-tracks every click-to-call (tel:) and click-to-text (sms:) link
 *    across the whole site, so we measure phone intent without touching each link.
 */

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export function SiteAnalytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("tel:")) trackEvent("call_clicked", { href });
      else if (href.startsWith("sms:")) trackEvent("text_clicked", { href });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <>
      <Analytics />
      {CLARITY_ID ? (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
        </Script>
      ) : null}
    </>
  );
}

/** Fire a conversion event to Vercel Analytics. Safe to call anywhere on the client. */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean | null>
) {
  try {
    track(name, props);
  } catch {
    /* analytics must never break the UX */
  }
}

/** Drop-in component that fires a conversion event once when it mounts. */
export function TrackOnMount({
  event,
  props,
}: {
  event: string;
  props?: Record<string, string | number | boolean | null>;
}) {
  useEffect(() => {
    trackEvent(event, props);
    // fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
