"use client";

import { useState } from "react";
import { Copy, Check, Users, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ReferralGenerator() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Simulate API call to create referral code in Supabase
    setTimeout(() => {
      // Mock generated link
      const code = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase() + Math.floor(Math.random() * 1000);
      setLink(`https://clearnest.services/book?ref=${code}`);
      setLoading(false);
    }, 800);
  };

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass glass-specular overflow-hidden rounded-[2.5rem] p-1.5 shadow-xl">
      <div className="relative rounded-br-[2.25rem] rounded-tl-[2.25rem] rounded-tr-[2.25rem] rounded-bl-[2.25rem] bg-background p-8 md:p-10">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-[80px]" />
        
        <div className="relative z-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <Users className="h-6 w-6" />
          </div>
          
          <h3 className="mt-6 text-2xl font-bold tracking-tight text-charcoal">
            Get your unique link
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-graphite">
            Enter your email to generate your personal referral link. Share it with friends, family, or neighbors in Salt Lake City.
          </p>

          <AnimatePresence mode="wait">
            {!link ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleGenerate} 
                className="mt-8 grid gap-4"
              >
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-stone/80 bg-paper/50 px-5 py-4 text-sm text-charcoal transition-colors focus:border-charcoal focus:bg-background focus:outline-none focus:ring-1 focus:ring-charcoal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-charcoal px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {loading ? "Generating..." : "Generate my link"}
                  </span>
                  {!loading && <span className="shine-bar" />}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 grid gap-4"
              >
                <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-800">Your Referral Link</p>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="truncate font-mono text-sm text-charcoal">{link}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleCopy}
                  className={cn(
                    "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-semibold transition-all",
                    copied 
                      ? "bg-green-100 text-green-800 hover:bg-green-200" 
                      : "bg-charcoal text-white hover:bg-brand-700"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied to clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy link
                    </>
                  )}
                </button>
                
                <p className="mt-2 text-center text-xs text-graphite flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent" />
                  Ready to share. Get $25 for every booked clean.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
