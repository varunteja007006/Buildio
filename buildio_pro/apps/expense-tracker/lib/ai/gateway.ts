import { createGateway } from "@ai-sdk/gateway";
import "server-only";

import { getItem, setItem } from "@/lib/redis";

/**
 * Returns the default statement-extraction model. There is no hardcoded
 * fallback: `AI_EXTRACTION_MODEL` must be configured (see .env.example).
 */
export function getDefaultExtractionModel(): string {
  const value = process.env.AI_EXTRACTION_MODEL?.trim();
  if (!value) {
    throw new Error(
      "AI_EXTRACTION_MODEL is required — set it to a gateway model id " +
        '(e.g. "openai/gpt-5.6-luna"). No hardcoded fallback exists.',
    );
  }
  return value;
}

export const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  teamIdOrSlug: process.env.AI_GATEWAY_TEAM_ID_OR_SLUG,
});

export type GatewayModelInfo = {
  id: string;
  name: string;
  description: string | null;
  /** Cost per input token in USD, when the gateway reports it. */
  inputPrice: string | null;
  /** Cost per output token in USD, when the gateway reports it. */
  outputPrice: string | null;
};

const MODELS_CACHE_KEY = "ai-gateway:models:v1";
const MODELS_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6 hours

function toGatewayModelInfo(entry: {
  id: string;
  name: string;
  description?: string | null;
  pricing?: { input?: string | null; output?: string | null } | null;
}): GatewayModelInfo {
  return {
    id: entry.id,
    name: entry.name,
    description: entry.description ?? null,
    inputPrice: entry.pricing?.input ?? null,
    outputPrice: entry.pricing?.output ?? null,
  };
}

/**
 * Lists the language models available on the configured Vercel AI Gateway.
 * Results are cached in Valkey for six hours; the gateway itself keeps an
 * in-memory metadata cache too, so this is cheap to call from a combobox.
 */
export async function listGatewayModels(): Promise<GatewayModelInfo[]> {
  const cached = await getItem(MODELS_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as GatewayModelInfo[];
    } catch {
      // fall through and refresh the cache
    }
  }

  const { models } = await gateway.getAvailableModels();

  const languageModels = models
    .filter((entry) => entry.modelType === "language" || !entry.modelType)
    .map(toGatewayModelInfo)
    .sort((a, b) => a.id.localeCompare(b.id));

  await setItem(
    MODELS_CACHE_KEY,
    JSON.stringify(languageModels),
    MODELS_CACHE_TTL_SECONDS,
  );

  return languageModels;
}
