"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Users, Calendar, Bot } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/ai/conversations", label: "AI", icon: Bot },
] as const;

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
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "rounded-lg px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 " +
                    (isActive
                      ? "bg-paper text-charcoal"
                      : "text-graphite hover:bg-paper/50 hover:text-charcoal")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
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
