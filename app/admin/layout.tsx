import Link from "next/link";
import { Logo } from "@/components/logo";

const tabs = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper/30">
      <header className="border-b border-stone/60 bg-background">
        <div className="container-tight flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <span className="rounded-full bg-charcoal px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-graphite transition hover:bg-paper hover:text-charcoal"
              >
                {t.label}
              </Link>
            ))}
            <form action="/api/admin/signout" method="post">
              <button
                type="submit"
                className="ml-3 inline-flex items-center gap-2 rounded-full border border-stone/80 px-3 py-1.5 text-sm font-medium text-charcoal hover:border-brand-300"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container-tight py-10">{children}</main>
    </div>
  );
}
