"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquareText } from "lucide-react";
import { BUSINESS } from "@/lib/utils";
import { Modal, ModalContent } from "@/components/ui/modal";
import { QuickLeadForm } from "./quick-lead-form";

export function FloatingCta() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:bottom-6 sm:right-6 sm:left-auto sm:justify-end sm:px-0 sm:pb-0"
          >
            <div className="glass glass-specular flex w-full max-w-md items-center gap-2 rounded-full p-1.5 shadow-card sm:w-auto">
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-stone/40 bg-background/70 px-4 py-3 text-sm font-semibold text-charcoal transition hover:border-brand-300 sm:flex-none"
              >
                <Phone className="h-4 w-4 text-brand-600" /> Call
              </a>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 sm:flex-none"
              >
                <MessageSquareText className="h-4 w-4" /> Free Quote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={open} onOpenChange={(v) => setOpen(v)}>
        <ModalContent>
          <span className="inline-flex items-center gap-2 rounded-full border border-stone/70 bg-paper/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-graphite">
            Free estimate · 60 seconds
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal">
            Get your free cleaning quote
          </h2>
          <p className="mt-1.5 text-sm text-graphite">
            Tell us where to send it — we'll text you a price and earliest opening.
          </p>
          <div className="mt-5">
            <QuickLeadForm defaults={{ source: "floating_cta" }} onDone={() => setTimeout(() => setOpen(false), 2500)} />
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}
