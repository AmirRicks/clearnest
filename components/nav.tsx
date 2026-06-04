"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BUSINESS, cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Magnetic } from "@/components/anim/magnetic";

const mainLinks = [
  { href: "/services", label: "Services" },
  { href: "/plans", label: "Plans" },
  { href: "/house-cleaning", label: "Areas" },
  { href: "/gallery", label: "Before & After" },
];

const secondaryLinks = [
  { href: "/referrals", label: "Refer & Earn" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-stone/60 bg-background/85 backdrop-blur-xl shadow-[0_1px_0_rgb(15_23_42/0.04)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-tight flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {mainLinks.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium text-graphite transition-colors hover:text-charcoal",
                  active && "text-charcoal"
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-paper"
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                  />
                )}
              </Link>
            );
          })}
          
          <div className="relative" onMouseLeave={() => setMoreOpen(false)}>
            <button
              onMouseEnter={() => setMoreOpen(true)}
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-graphite transition-colors hover:text-charcoal",
                secondaryLinks.some((l) => pathname === l.href || pathname.startsWith(l.href + "/")) && "text-charcoal"
              )}
            >
              More <ChevronDown className="h-3 w-3 opacity-70" />
              {secondaryLinks.some((l) => pathname === l.href || pathname.startsWith(l.href + "/")) && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-full bg-paper"
                  transition={{ type: "spring", stiffness: 400, damping: 40 }}
                />
              )}
            </button>
            
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-2xl border border-stone/60 bg-background/95 p-2 shadow-xl backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-1">
                    {secondaryLinks.map((l) => {
                      const active = pathname === l.href || pathname.startsWith(l.href + "/");
                      return (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-paper/80",
                            active ? "bg-paper text-charcoal" : "text-graphite hover:text-charcoal"
                          )}
                        >
                          {l.label}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex items-center gap-2 rounded-full border border-stone/80 px-3.5 py-2 text-sm font-medium text-charcoal transition hover:border-brand-300 hover:text-brand-700"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden xl:inline">{BUSINESS.phone}</span>
            <span className="xl:hidden">Call</span>
          </a>
          <Magnetic strength={0.25}>
            <Link
              href="/book"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              <span className="relative z-10">Book Cleaning</span>
              <span className="shine-bar" />
            </Link>
          </Magnetic>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-stone/80 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-t border-stone/60 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-tight grid gap-1 py-4">
              {[...mainLinks, ...secondaryLinks].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl px-3 py-3 text-base font-medium text-charcoal hover:bg-paper"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-stone/80 px-4 py-3 text-sm font-medium text-charcoal"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </a>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-4 py-3 text-sm font-semibold text-white"
                >
                  Book Cleaning
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
