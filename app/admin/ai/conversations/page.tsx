import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Clock } from "lucide-react";

export const metadata = { title: "AI Conversations | ClearNest Admin" };

const PAGE_SIZE = 25;

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const category = params.category || "";

  let query = supabase
    .from("ai_conversations")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data: conversations, count } = await query;
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  const categoryCounts = await supabase
    .from("ai_conversations")
    .select("category, count:category", { count: "exact", head: false })
    .order("category");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-charcoal mb-6">AI Conversations</h1>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["all", "booking", "support", "refund", "complaint", "general"].map((cat) => (
          <Link
            key={cat}
            href={`/admin/ai/conversations?category=${cat}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              (category === cat || (!category && cat === "all"))
                ? "bg-charcoal text-white"
                : "bg-paper text-graphite hover:bg-stone/70"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone/70 bg-background shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/60 bg-paper/50">
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Summary</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Messages</th>
                <th className="px-4 py-3 text-left font-semibold text-charcoal">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {(!conversations || conversations.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-graphite text-sm">
                    No conversations yet.
                  </td>
                </tr>
              )}
              {conversations?.map((c: any) => (
                <tr key={c.id} className="border-b border-stone/40 hover:bg-paper/30 transition">
                  <td className="px-4 py-3">
                    <Link href={`/admin/ai/conversations/${c.id}`} className="font-medium text-charcoal hover:text-brand-600">
                      {c.user_name || c.user_email || "Anonymous"}
                    </Link>
                    {c.user_email && (
                      <p className="text-xs text-graphite">{c.user_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-xs font-medium text-graphite border border-stone/60">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-graphite max-w-xs truncate">
                    {c.summary || "—"}
                  </td>
                  <td className="px-4 py-3 text-graphite">{c.message_count || 0}</td>
                  <td className="px-4 py-3 text-graphite text-xs">
                    {c.updated_at ? new Date(c.updated_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/ai/conversations?page=${p}${category ? `&category=${category}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                p === page ? "bg-charcoal text-white" : "bg-paper text-graphite hover:bg-stone/70"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
