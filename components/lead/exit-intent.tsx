"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Modal, ModalContent } from "@/components/ui/modal";
import { QuickLeadForm } from "./quick-lead-form";

const SEEN_KEY = "cn_exit_intent_seen";

/**
 * Exit-intent founding-customer offer. Fires once per session when the cursor
 * leaves the top of the viewport (desktop) or after a dwell timeout (mobile).
 */
export function ExitIntent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SEEN_KEY)) return;

    const trigger = () => {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
      cleanup();
    };

    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    // Mobile: no mouseleave — fire after 35s of engaged dwell.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let timer: number | undefined;
    if (isTouch) timer = window.setTimeout(trigger, 35000);
    else document.addEventListener("mouseout", onLeave);

    function cleanup() {
      document.removeEventListener("mouseout", onLeave);
      if (timer) window.clearTimeout(timer);
    }
    return cleanup;
  }, []);

  return (
    <Modal open={open} onOpenChange={(v) => setOpen(v)}>
      <ModalContent maxWidth="max-w-lg">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
          <Sparkles className="h-3.5 w-3.5" /> Founding-customer offer
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          $25 off your first clean
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-graphite">
          We're new in Salt Lake County and building our reputation one spotless home at a time.
          Grab $25 off your first booking — leave your info and we'll send your quote + code.
          Pay after the clean, always.
        </p>
        <div className="mt-5">
          <QuickLeadForm
            defaults={{ source: "exit_intent" }}
            cta="Claim $25 off"
            onDone={() => setTimeout(() => setOpen(false), 2800)}
          />
        </div>
      </ModalContent>
    </Modal>
  );
}
