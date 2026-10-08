import { gateway } from "ai";

/**
 * Embedding configuration for RAG ingestion + retrieval, via the Vercel AI
 * Gateway (one key for all providers). Auth: `AI_GATEWAY_API_KEY` env var, or
 * automatic Vercel OIDC when deployed on Vercel.
 *
 * There are no hardcoded model ids or dimensions — `AI_EMBEDDING_MODEL` and
 * `AI_EMBEDDING_DIMENSIONS` are required (see .env.example). The configured
 * dimension MUST match the `embeddings.embedding` vector column; changing one
 * without the other makes every insert/retrieval fail loudly.
 */
function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required — no hardcoded fallback exists. ` +
        "See .env.example for the expected value.",
    );
  }
  return value;
}

export const embeddingModelId = requireEnv("AI_EMBEDDING_MODEL");

function parseEmbeddingDimensions(): number {
  const raw = requireEnv("AI_EMBEDDING_DIMENSIONS");
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `AI_EMBEDDING_DIMENSIONS must be a positive integer, got "${raw}". ` +
        "It must match the embeddings.embedding vector column dimension.",
    );
  }
  return value;
}

export const embeddingDimensions = parseEmbeddingDimensions();

export const embeddingModel = gateway.embedding(embeddingModelId);

/** Provider options are keyed by the `<provider>/` prefix of the model id. */
export const embeddingProviderOptions = {
  [embeddingModelId.split("/")[0]]: {
    outputDimensionality: embeddingDimensions,
  },
} as const;
