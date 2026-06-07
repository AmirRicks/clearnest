import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function AdminSettings() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        Supabase isn’t configured yet — settings management is disabled.
      </div>
    );
  }
  const sb = await createClient();
  const { data } = await sb.from("site_settings").select("key, value");
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));

  return (
    <div className="grid gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Site settings</h1>
        <p className="mt-1 text-sm text-graphite">
          These values are displayed across the public site.
        </p>
      </header>
      <SettingsForm initial={map} />
    </div>
  );
}
