"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2, Phone, ChevronDown } from "lucide-react";

const SESSION_KEY = "clearnest_ai_session";
const HISTORY_KEY = "clearnest_ai_history";
const CONVERSATION_KEY = "clearnest_ai_conversation";

function generateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = "ai-" + crypto.randomUUID().slice(0, 12);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

type StreamEvent =
  | { type: "token"; content: string }
  | { type: "error"; content: string }
  | { type: "done"; conversationId: string }
  | { type: "tool_results"; results: any[] };

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restore session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(HISTORY_KEY);
    const savedConv = sessionStorage.getItem(CONVERSATION_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
    if (savedConv) setConversationId(savedConv);
  }, []);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isNearBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, []);

  useEffect(() => {
    if (isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent, isNearBottom]);

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const sendMessage = useCallback(async (textOverride?: string) => {
    const text = (typeof textOverride === "string" ? textOverride : input).trim();
    if (!text || isStreaming) return;
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    addMessage({ role: "user", content: text });

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const sessionId = generateSessionId();

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          conversationId,
          history,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        addMessage({
          role: "assistant",
          content: err.error || "Something went wrong. Please try again.",
        });
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullResponse = "";
      let buffer = "";
      let added = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event: StreamEvent = JSON.parse(line);
            switch (event.type) {
              case "token":
                fullResponse += event.content;
                setStreamingContent(fullResponse);
                break;
              case "error":
                fullResponse += `\n\n${event.content}`;
                setStreamingContent(fullResponse);
                break;
              case "done":
                if (event.conversationId) {
                  setConversationId(event.conversationId);
                  sessionStorage.setItem(CONVERSATION_KEY, event.conversationId);
                }
                addMessage({ role: "assistant", content: fullResponse });
                setStreamingContent("");
                added = true;
                break;
              case "tool_results":
                // Tool results are logged silently
                break;
            }
          } catch {}
        }
      }

      // If the stream ended without a `done` event (e.g. dropped connection),
      // still persist what we received — but never double-add.
      if (!added && fullResponse) {
        addMessage({ role: "assistant", content: fullResponse });
        setStreamingContent("");
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      addMessage({
        role: "assistant",
        content: "I'm having trouble connecting. Please try again or call (801) 441-0726.",
      });
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, conversationId, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setConversationId(null);
    sessionStorage.removeItem(HISTORY_KEY);
    sessionStorage.removeItem(CONVERSATION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-white shadow-2xl shadow-charcoal/30 hover:bg-brand-700 transition-colors"
          aria-label="Open AI Receptionist"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : undefined,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] ${
              isMinimized ? "" : "h-[600px] max-h-[calc(100vh-6rem)]"
            } rounded-2xl bg-background border border-stone/70 shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone/70 bg-charcoal text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  CN
                </div>
                <div>
                  <p className="text-sm font-semibold">ClearNest AI</p>
                  <p className="text-[10px] text-white/60">Receptionist &bull; Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded-lg p-1.5 hover:bg-white/10 transition"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isMinimized ? null : (
              <>
                {/* Messages */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                  {messages.length === 0 && !isStreaming && (
                    <div className="text-center py-8">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-charcoal">
                        Hello! I&apos;m the ClearNest AI Receptionist.
                      </p>
                      <p className="mt-1 text-xs text-graphite">
                        I can help with services, availability, quotes, bookings, support, and more.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {[
                          "What services do you offer?",
                          "How much is standard cleaning?",
                          "Can I book this week?",
                          "I need to reschedule",
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="rounded-full border border-stone/70 px-3 py-1.5 text-xs text-graphite hover:border-brand-300 hover:bg-brand-50 transition"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-charcoal text-white rounded-br-md"
                            : "bg-paper text-charcoal border border-stone/60 rounded-bl-md"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}

                  {streamingContent && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-paper text-charcoal border border-stone/60 rounded-bl-md">
                        <div className="whitespace-pre-wrap">
                          {streamingContent}
                          <span className="inline-block w-1.5 h-4 bg-brand-500 animate-pulse ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="shrink-0 border-t border-stone/70 px-4 py-3 bg-background">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about services, booking..."
                      disabled={isStreaming}
                      className="flex-1 rounded-xl border border-stone/70 bg-paper px-4 py-2.5 text-sm text-charcoal placeholder:text-graphite/50 focus:outline-none focus:border-brand-400 transition disabled:opacity-50"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isStreaming}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal text-white hover:bg-brand-700 transition disabled:opacity-40"
                      aria-label="Send"
                    >
                      {isStreaming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <a
                      href="tel:+18014410726"
                      className="inline-flex items-center gap-1 text-[10px] text-graphite hover:text-charcoal transition"
                    >
                      <Phone className="h-3 w-3" />
                      Call (801) 441-0726
                    </a>
                    {messages.length > 0 && (
                      <button
                        onClick={resetChat}
                        className="text-[10px] text-graphite hover:text-charcoal transition underline"
                      >
                        New conversation
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
