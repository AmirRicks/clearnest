import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Conversation | ClearNest Admin" };

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const { id } = await params;

  const { data: conversation } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (!conversation) {
    return (
      <div className="text-center py-16">
        <p className="text-graphite">Conversation not found.</p>
        <Link href="/admin/ai/conversations" className="text-brand-600 hover:underline mt-2 inline-block">
          Back to conversations
        </Link>
      </div>
    );
  }

  const { data: messages } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Link
        href="/admin/ai/conversations"
        className="inline-flex items-center gap-1 text-sm text-graphite hover:text-charcoal mb-4 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to conversations
      </Link>

      <div className="rounded-2xl border border-stone/70 bg-background shadow-soft p-6 mb-6">
        <h1 className="text-xl font-bold text-charcoal mb-2">
          {conversation.user_name || conversation.user_email || "Anonymous"}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-graphite">
          <span>Category: <strong className="text-charcoal">{conversation.category}</strong></span>
          <span>Messages: <strong className="text-charcoal">{conversation.message_count || 0}</strong></span>
          <span>Started: <strong className="text-charcoal">{new Date(conversation.created_at).toLocaleString()}</strong></span>
          <span>Last: <strong className="text-charcoal">{new Date(conversation.updated_at).toLocaleString()}</strong></span>
        </div>
        {conversation.user_email && (
          <p className="mt-2 text-sm">
            <a href={`mailto:${conversation.user_email}`} className="text-brand-600 hover:underline">
              {conversation.user_email}
            </a>
          </p>
        )}
        {conversation.summary && (
          <p className="mt-3 text-sm text-graphite bg-paper rounded-xl p-3 border border-stone/60">
            <strong>Summary:</strong> {conversation.summary}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-stone/70 bg-background shadow-soft p-6">
        <h2 className="text-lg font-bold text-charcoal mb-4">Messages</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {(!messages || messages.length === 0) && (
            <p className="text-graphite text-sm">No messages found.</p>
          )}
          {messages?.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-charcoal text-white rounded-br-md"
                    : "bg-paper text-charcoal border border-stone/60 rounded-bl-md"
                }`}
              >
                <div className="text-[10px] font-medium opacity-60 mb-1 uppercase tracking-wider">
                  {msg.role}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[10px] opacity-40 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
