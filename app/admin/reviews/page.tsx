import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Review } from "@/lib/supabase/types";
import { ReviewsManager } from "./reviews-manager";

export default async function AdminReviews() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        Supabase isn’t configured yet — review CMS is disabled.
      </div>
    );
  }
  const sb = await createClient();
  const { data, error } = await sb
    .from("reviews")
    .select("*")
    .order("featured", { ascending: false })
    .order("reviewed_at", { ascending: false });
  if (error) {
    return <p className="text-sm text-danger">Failed to load: {error.message}</p>;
  }
  return <ReviewsManager initial={(data ?? []) as Review[]} />;
}
