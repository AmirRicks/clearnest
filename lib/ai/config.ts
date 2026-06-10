export type AIConfig = {
  apiKey: string;
  baseUrl: string;
  /** Models tried in order — the first that responds wins (free models are
   *  flaky/rate-limited, so we always keep fallbacks). */
  models: string[];
  maxTokens: number;
  temperature: number;
};

/**
 * Curated free OpenRouter stack (valid IDs as of 2026). The previous value
 * `"openrouter/free"` is NOT a real model and made every request 400 — the AI
 * receptionist could never answer. Keep these as known-good free models.
 */
// Llama 3.3 first: a clean instruct model that follows the TOOL_CALL protocol and
// streams in `content` (not a separate reasoning channel), which the gpt-oss
// reasoning model does not — that mismatch made tool queries come back blank.
const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "openai/gpt-oss-20b:free",
  "microsoft/phi-3.5-mini-128k-instruct:free",
];

export function getAIConfig(): AIConfig | null {
  // Accept either name so prod (AI_API_KEY) and the Brain's standard
  // (OPENROUTER_API_KEY) both work.
  const key = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!key) return null;

  // Optional comma-separated override, else the curated free stack.
  const override = process.env.AI_MODELS?.split(",").map((s) => s.trim()).filter(Boolean);

  return {
    apiKey: key,
    baseUrl: process.env.AI_BASE_URL || "https://openrouter.ai/api/v1",
    models: override && override.length ? override : FREE_MODELS,
    maxTokens: 2048,
    temperature: 0.7,
  };
}

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

/**
 * Stream a chat completion, trying each configured model until one starts
 * responding. A model that fails at request time (bad id, 404, 429) is skipped
 * BEFORE any tokens are emitted, so the user never sees duplicated/garbled
 * output. Returns the full text.
 */
export async function streamAIResponse(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const config = getAIConfig();
  if (!config) {
    const fallback = "Our assistant is offline right now — please call (801) 441-0726 and we'll help you straight away.";
    onToken(fallback);
    return fallback;
  }

  let lastErr: unknown = null;
  for (const model of config.models) {
    try {
      return await streamOne(config, model, messages, onToken, signal);
    } catch (err) {
      lastErr = err;
      console.warn(`[AI] model ${model} failed, trying next:`, (err as Error)?.message);
    }
  }
  throw lastErr ?? new Error("All AI models failed");
}

async function streamOne(
  config: AIConfig,
  model: string,
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer": "https://clearnest.services",
      "X-Title": "ClearNest AI Receptionist",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    // Thrown before any token is emitted → safe to fall back to the next model.
    throw new Error(`AI API error (${res.status}) on ${model}: ${errText.slice(0, 200)}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let content = "";    // the visible answer (streamed to the user)
  let reasoning = "";  // the model's private monologue (NEVER shown)

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta || {};
        if (delta.content) {
          content += delta.content;
          onToken(delta.content); // only real content reaches the customer
        }
        if (delta.reasoning) reasoning += delta.reasoning; // captured, not shown
      } catch {
        // Skip malformed lines
      }
    }
  }

  // Reasoning models (gpt-oss) sometimes place the TOOL_CALL line in the
  // reasoning channel. Surface ONLY those lines for the parser — never the prose.
  const toolLines = reasoning
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("TOOL_CALL:"));
  let result = content;
  if (toolLines.length) result += (result ? "\n" : "") + toolLines.join("\n");
  return result;
}
