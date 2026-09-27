import { embed, embedMany } from "ai";
import { and, cosineDistance, desc, eq, gt, inArray, isNull, sql } from "drizzle-orm";

import { embeddingModel, embeddingProviderOptions } from "@/lib/ai";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { embeddings } from "@/lib/db/schema/embeddings";
import { resources } from "@/lib/db/schema/resources";

/**
 * Splits text into overlapping chunks of roughly `chunkSize` characters.
 */
export function generateChunks(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200,
): string[] {
  if (chunkSize <= 0) throw new Error("chunkSize must be positive");
  if (overlap < 0) throw new Error("overlap must be non-negative");
  if (overlap >= chunkSize)
    throw new Error("overlap must be less than chunkSize");

  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    // Try to break at a sentence or paragraph boundary for cleaner chunks
    let breakPoint = end;
    if (end < text.length) {
      // Look for paragraph break first
      const paragraphBreak = text.lastIndexOf("\n\n", end);
      if (paragraphBreak > start) {
        breakPoint = paragraphBreak;
      } else {
        // Look for sentence end
        const sentenceBreak = Math.max(
          text.lastIndexOf(". ", end),
          text.lastIndexOf("! ", end),
          text.lastIndexOf("? ", end),
          text.lastIndexOf(".\n", end),
        );
        if (sentenceBreak > start) {
          breakPoint = sentenceBreak + 1; // include the period
        }
      }
    }

    chunks.push(text.slice(start, breakPoint).trim());

    // The final chunk can be shorter than `overlap`, and whitespace-heavy
    // text can put the chosen break within `overlap` of `start` — either
    // would make `start` stall or regress and loop forever. In that case
    // continue just past the break point.
    if (breakPoint >= text.length) break;
    const nextStart = breakPoint - overlap;
    start = nextStart > start ? nextStart : breakPoint + 1;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Generates an embedding vector for a single text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: embeddingProviderOptions,
  });
  return embedding;
}

/**
 * Generates embedding vectors for multiple text strings (batched).
 * Also returns the embedding token usage reported by the provider.
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<{ vectors: number[][]; tokens: number | null }> {
  const { embeddings: vectors, usage } = await embedMany({
    model: embeddingModel,
    values: texts,
    maxParallelCalls: 5,
    providerOptions: embeddingProviderOptions,
  });
  return { vectors, tokens: usage?.tokens ?? null };
}

/**
 * Finds the most relevant content chunks for a query using cosine similarity,
 * scoped to a single workspace. Only returns results above the similarity threshold.
 * When `topicIds` is provided, only content from documents in those topics is
 * considered (used by agent chats scoped to attached topics).
 */
export async function findRelevantContent(
  userQuery: string,
  workspaceId: string,
  topicIds?: string[],
): Promise<{ name: string; similarity: number }[]> {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .innerJoin(resources, eq(embeddings.resourceId, resources.id))
    .leftJoin(documents, eq(resources.documentId, documents.id))
    .where(
      and(
        eq(embeddings.workspaceId, workspaceId),
        isNull(embeddings.deletedAt),
        isNull(resources.deletedAt),
        isNull(documents.deletedAt),
        topicIds && topicIds.length
          ? inArray(documents.topicId, topicIds)
          : undefined,
        gt(similarity, 0.5),
      ),
    )
    .orderBy((t) => desc(t.similarity))
    .limit(4);
  return similarGuides;
}
