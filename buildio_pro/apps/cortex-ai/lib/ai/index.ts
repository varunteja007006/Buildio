import { createOpenAI } from "@ai-sdk/openai";

/**
 * OpenAI-compatible provider configured for Vercel AI Gateway.
 *
 * Uses the `AI_GATEWAY_API_KEY` env var (a Vercel API key starting with `vck_`).
 * Falls back to `OPENAI_API_KEY` if the gateway key is not set.
 *
 * For local dev you may also need to set `OPENAI_BASE_URL` to your
 * Vercel AI Gateway endpoint, e.g.:
 *   https://gateway.ai.vercel.com/v1/{teamId}/openai
 *
 * When deployed on Vercel, the gateway routing is automatic.
 */
export const openai = createOpenAI({
  apiKey:
    process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY ?? undefined,
});

export const embeddingModel = openai.embedding("text-embedding-3-small");
