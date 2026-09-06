/**
 * Fallback chat model catalog used when the Vercel AI Gateway cannot be
 * reached (e.g. local dev without AI_GATEWAY_API_KEY). In production the
 * available models are fetched from the gateway at runtime — see
 * lib/chat/catalog.ts.
 *
 * Model ids use the `<provider>/<model>` form so they can be resolved
 * directly by the AI SDK / Vercel AI Gateway in app/api/chat/route.ts.
 */
export type ChatModelOption = {
  id: string;
  label: string;
  description: string;
};

export const FALLBACK_CHAT_MODELS: ChatModelOption[] = [
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    description: "Fast, smart default for everyday chat",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o mini",
    description: "Lowest cost, quickest responses",
  },
  {
    id: "openai/gpt-4.1",
    label: "GPT-4.1",
    description: "Best for long context and coding",
  },
  {
    id: "openai/gpt-4.1-mini",
    label: "GPT-4.1 mini",
    description: "Balanced speed and quality",
  },
  {
    id: "openai/gpt-4.1-nano",
    label: "GPT-4.1 nano",
    description: "Cheap and fast for simple answers",
  },
  {
    id: "openai/o3-mini",
    label: "o3-mini",
    description: "Reasoning model, good for logic and math",
  },
  {
    id: "openai/o4-mini",
    label: "o4-mini",
    description: "Small reasoning model with tool use",
  },
];

export const DEFAULT_CHAT_MODEL_ID = "openai/gpt-4o";

/**
 * Loose shape check for a gateway model id (`provider/model`). Strict
 * membership is decided by the gateway itself — the catalog can change.
 */
export function isWellFormedChatModelId(
  model: unknown,
): model is string {
  return (
    typeof model === "string" &&
    /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/i.test(model)
  );
}
