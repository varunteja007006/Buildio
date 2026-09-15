import { gateway } from "ai";

/**
 * Embedding model for RAG ingestion + retrieval, via the Vercel AI Gateway
 * (one key for all providers). Auth: `AI_GATEWAY_API_KEY` env var, or
 * automatic Vercel OIDC when deployed on Vercel.
 *
 * `outputDimensionality` is pinned to 1536 via `embeddingProviderOptions`
 * to match the `embeddings.embedding` vector(1536) column —
 * google/gemini-embedding-2 defaults to 3072 dimensions.
 */
export const embeddingModel = gateway.embedding("google/gemini-embedding-2");

/** Pins gemini-embedding-2 output to the DB's vector(1536) column. */
export const embeddingProviderOptions = {
  google: { outputDimensionality: 1536 },
} as const;
