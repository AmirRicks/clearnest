export type AIConfig = {
  provider: "openrouter" | "deepseek" | "gemini";
  model: string;
  apiKey: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
};

export function getAIConfig(): AIConfig | null {
  const key = process.env.AI_API_KEY;
  if (!key) return null;

  return {
    provider: "openrouter",
    model: "openrouter/free",
    apiKey: key,
    baseUrl: "https://openrouter.ai/api/v1",
    maxTokens: 2048,
    temperature: 0.7,
  };
}

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function streamAIResponse(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const config = getAIConfig();
  if (!config) {
    const fallback = "AI system is not configured. Please set AI_API_KEY in environment variables.";
    onToken(fallback);
    return fallback;
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "HTTP-Referer": "https://clearnest.services",
      "X-Title": "ClearNest AI Receptionist",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API error (${res.status}): ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let full = "";

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
        const content = delta.content || delta.reasoning || "";
        if (content) {
          full += content;
          onToken(content);
        }
      } catch {
        // Skip malformed lines
      }
    }
  }

  return full;
}
