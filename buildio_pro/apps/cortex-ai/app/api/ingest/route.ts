import { and, eq, inArray, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { recordDocumentAudit } from "@/lib/audit/document-audit";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { ingestDocument } from "@/lib/ingest/ingest-document";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

/**
 * Ingest documents (chunk → embed → store).
 *
 * Body (optional): `{ documentIds?: string[] }` — ingest only those
 * documents. Omitted → ingest every uningested document in the workspace.
 *
 * Per document, the latest approved extraction's content is consumed
 * (falling back to the raw file); re-ingestion soft-deletes the document's
 * previous resources so the new one supersedes them.
 */
export async function POST(request: Request) {
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

    const body = (await request.json().catch(() => null)) as {
      documentIds?: unknown;
    } | null;
    const requestedIds = Array.isArray(body?.documentIds)
      ? body.documentIds.filter(
          (id: unknown): id is string =>
            typeof id === "string" && id.length > 0,
        )
      : [];

    // Resolve the target documents (workspace-scoped, active only)
    let targets: { id: string; filename: string; filepath: string }[];
    if (requestedIds.length > 0) {
      targets = await db
        .select({
          id: documents.id,
          filename: documents.filename,
          filepath: documents.filepath,
        })
        .from(documents)
        .where(
          and(
            inArray(documents.id, requestedIds),
            eq(documents.workspaceId, workspace.id),
            isNull(documents.deletedAt),
          ),
        );
      if (targets.length !== new Set(requestedIds).size) {
        return NextResponse.json(
          {
            success: false,
            error: "Some documents were not found in this workspace",
          },
          { status: 404 },
        );
      }
    } else {
      targets = await db
        .select({
          id: documents.id,
          filename: documents.filename,
          filepath: documents.filepath,
        })
        .from(documents)
        .where(
          and(
            eq(documents.workspaceId, workspace.id),
            eq(documents.ingested, false),
            isNull(documents.deletedAt),
          ),
        );
    }

    if (targets.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No documents to ingest",
        ingested: 0,
        failed: 0,
        results: [],
      });
    }

    const results: {
      documentId: string;
      filename: string;
      success: boolean;
      chunksCount?: number;
      source?: "extraction" | "file";
      error?: string;
    }[] = [];

    for (const doc of targets) {
      const docStartedAt = Date.now();
      let outcome: Awaited<ReturnType<typeof ingestDocument>>;
      try {
        outcome = await ingestDocument(doc, workspace.id);
      } catch (error) {
        outcome = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }

      results.push(
        outcome.success
          ? {
              documentId: doc.id,
              filename: doc.filename,
              success: true,
              chunksCount: outcome.chunksCount,
              source: outcome.source,
            }
          : {
              documentId: doc.id,
              filename: doc.filename,
              success: false,
              error: outcome.error,
            },
      );

      // F2: audit the ingestion (chunk counts + resource id + embedding
      // tokens in `usage`)
      void recordDocumentAudit({
        userId: user.id,
        workspaceId: workspace.id,
        action: "ingest",
        documentIds: [doc.id],
        usage: outcome.success
          ? {
              chunksCount: outcome.chunksCount,
              resourceId: outcome.resourceId,
              source: outcome.source,
              embeddingTokens: outcome.embeddingTokens,
            }
          : null,
        durationMs: Date.now() - docStartedAt,
        status: outcome.success ? "completed" : "failed",
        error: outcome.success ? null : outcome.error,
      }).catch(console.error);
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
