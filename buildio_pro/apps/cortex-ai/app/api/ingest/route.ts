import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { resources } from "@/lib/db/schema/resources";
import { embeddings } from "@/lib/db/schema/embeddings";
import { generateChunks, generateEmbeddings } from "@/lib/ai/embedding";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".mdx", ".csv"]);

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const workspace = await getActiveWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "No active workspace" },
        { status: 400 },
      );
    }

    // 1. Find all uningested documents in the active workspace
    const uningested = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.workspaceId, workspace.id),
          eq(documents.ingested, false),
        ),
      );

    if (uningested.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No documents to ingest",
        ingested: 0,
      });
    }

    const results: {
      filename: string;
      success: boolean;
      chunksCount?: number;
      error?: string;
    }[] = [];

    for (const doc of uningested) {
      try {
        // 2. Check file extension (skip unsupported formats)
        const ext = path.extname(doc.filename).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.has(ext)) {
          results.push({
            filename: doc.filename,
            success: false,
            error: `Unsupported file format: ${ext}. Supported: ${[...SUPPORTED_EXTENSIONS].join(", ")}. PDF/text extraction not yet implemented.`,
          });
          continue;
        }

        // 3. Read file content
        const content = await fs.readFile(doc.filepath, "utf-8");

        // 3. Insert resource
        const [resource] = await db
          .insert(resources)
          .values({ workspaceId: workspace.id, content })
          .returning({ id: resources.id });

        // 4. Chunk and embed
        const chunks = generateChunks(content);
        const vectors = await generateEmbeddings(chunks);

        // 5. Store embeddings
        if (chunks.length > 0) {
          await db.insert(embeddings).values(
            chunks.map((chunk, i) => ({
              workspaceId: workspace.id,
              resourceId: resource.id,
              content: chunk,
              embedding: vectors[i],
            })),
          );
        }

        // 6. Mark document as ingested
        await db
          .update(documents)
          .set({ ingested: true })
          .where(eq(documents.id, doc.id));

        results.push({
          filename: doc.filename,
          success: true,
          chunksCount: chunks.length,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          filename: doc.filename,
          success: false,
          error: message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ingested: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
