"use server";

import { db } from "@/lib/db";
import { resources } from "@/lib/db/schema/resources";
import { embeddings } from "@/lib/db/schema/embeddings";
import { generateChunks, generateEmbeddings } from "@/lib/ai/embedding";

export interface CreateResourceResult {
  success: boolean;
  resourceId?: string;
  chunksCount?: number;
  error?: string;
}

/**
 * Creates a resource by chunking the content, generating embeddings,
 * and storing both in the database, scoped to the given workspace.
 */
export async function createResource(
  content: string,
  workspaceId: string,
): Promise<CreateResourceResult> {
  try {
    if (!content || content.trim().length === 0) {
      return { success: false, error: "Content cannot be empty" };
    }

    // 1. Insert the resource
    const [resource] = await db
      .insert(resources)
      .values({ workspaceId, content })
      .returning({ id: resources.id });

    // 2. Chunk the content
    const chunks = generateChunks(content);

    // 3. Generate embeddings for all chunks
    const vectors = await generateEmbeddings(chunks);

    // 4. Store embeddings
    if (chunks.length > 0) {
      await db.insert(embeddings).values(
        chunks.map((chunk, i) => ({
          workspaceId,
          resourceId: resource.id,
          content: chunk,
          embedding: vectors[i],
        })),
      );
    }

    return {
      success: true,
      resourceId: resource.id,
      chunksCount: chunks.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create resource:", message);
    return { success: false, error: message };
  }
}
