"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BeforeAfter } from "./before-after";
import { Eyebrow, H2, Lead, Section } from "./section";

const previews = [
  { id: "kitchen-01", label: "Kitchen — deep clean", category: "Kitchen" },
  { id: "living-01", label: "Living room — recurring", category: "Living" },
  { id: "bathroom-01", label: "Master bath — restoration", category: "Bathroom" },
];

export function GalleryStrip() {
  return (
    <Section id="gallery-preview">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Before & After</Eyebrow>
          <H2>Drag to reveal the ClearNest difference.</H2>
          <Lead>
            Real-feeling visuals built from our checklist — interactive and unique to ClearNest. Full
            gallery of homes is on the gallery page.
          </Lead>
        </div>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 rounded-full border border-stone/80 bg-background px-4 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300 hover:text-brand-700"
        >
          See full gallery <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {previews.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
          >
            <BeforeAfter pair={p} />
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
