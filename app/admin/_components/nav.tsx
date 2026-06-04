"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Users, Calendar } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function Nav({ user }: { user: User }) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <header className="border-b border-stone/60 bg-background shadow-soft">
      <div className="container-tight flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold tracking-tight text-charcoal">
            ClearNest Admin
          </span>
          <nav className="flex items-center gap-1">
            <Link
              href="/admin/leads"
              className={
                "rounded-lg px-3 py-2 text-sm font-medium transition " +
                (pathname === "/admin/leads"
                  ? "bg-paper text-charcoal"
                  : "text-graphite hover:bg-paper/50 hover:text-charcoal")
              }
            >
              <Users className="mr-2 inline-flex h-4 w-4" />
              Leads
            </Link>
            <Link
              href="/admin/calendar"
              className={
                "rounded-lg px-3 py-2 text-sm font-medium transition " +
                (pathname === "/admin/calendar"
                  ? "bg-paper text-charcoal"
                  : "text-graphite hover:bg-paper/50 hover:text-charcoal")
              }
            >
              <Calendar className="mr-2 inline-flex h-4 w-4" />
              Calendar
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-graphite">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-lg border border-stone/80 px-3 py-2 text-sm font-medium text-charcoal transition hover:border-charcoal hover:bg-paper"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
