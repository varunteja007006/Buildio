import { and, eq, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { extractionVersions } from "@/lib/db/schema/extraction-versions";
import { extractions } from "@/lib/db/schema/extractions";
import {
  runExtraction,
  type TemplateSnapshot,
} from "@/lib/extraction/run-extraction";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

/** Run (or re-run) a single extraction job. */
export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getActiveWorkspace(user.id);
    if (!workspace)
      return NextResponse.json(
        { error: "No active workspace" },
        { status: 400 },
      );
    const { id } = await params;

    const [row] = await db
      .select({
        extraction: extractions,
        filename: documents.filename,
        filepath: documents.filepath,
      })
      .from(extractions)
      .innerJoin(documents, eq(extractions.documentId, documents.id))
      .where(
        and(
          eq(extractions.id, id),
          eq(documents.workspaceId, workspace.id),
          isNull(extractions.deletedAt),
        ),
      )
      .limit(1);
    if (!row)
      return NextResponse.json(
        { error: "Extraction not found" },
        { status: 404 },
      );

    const { extraction, filename, filepath } = row;
    if (extraction.status === "processing")
      return NextResponse.json(
        { error: "Extraction is already running" },
        { status: 409 },
      );

    const [processing] = await db
      .update(extractions)
      .set({ status: "processing", error: null })
      .where(and(eq(extractions.id, id), isNull(extractions.deletedAt)))
      .returning();

    const startedAt = Date.now();
    console.log(
      `[extraction] start id=${id} model=${processing.model ?? "default"}`,
    );

    try {
      const template = (extraction.templateSnapshot ?? {}) as TemplateSnapshot;
      if (!template.instructions)
        throw new Error("Extraction has no template instructions");

      const result = await runExtraction({
        template,
        filename,
        filepath,
        model: processing.model,
      });

      const [{ nextVersion }] = await db
        .select({
          nextVersion: sql<number>`coalesce(max(${extractionVersions.version}), 0) + 1`,
        })
        .from(extractionVersions)
        .where(eq(extractionVersions.extractionId, id));

      await db.insert(extractionVersions).values({
        extractionId: id,
        version: nextVersion,
        source: "ai",
        content: result.rawOutput,
        structuredOutput: result.structuredOutput,
        createdBy: user.id,
      });

      const [completed] = await db
        .update(extractions)
        .set({
          status: "completed",
          rawOutput: result.rawOutput,
          currentContent: result.rawOutput,
          structuredOutput: result.structuredOutput,
          model: result.model,
          provider: result.provider,
          usage: result.usage,
          error: result.structuredError,
          // New content supersedes any previous review approval
          approved: false,
        })
        .where(eq(extractions.id, id))
        .returning();

      console.log(
        `[extraction] done id=${id} status=completed in ${(
          (Date.now() - startedAt) / 1000
        ).toFixed(1)}s`,
      );
      return NextResponse.json({ extraction: completed });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown extraction error";
      const [failed] = await db
        .update(extractions)
        .set({ status: "failed", error: message })
        .where(eq(extractions.id, id))
        .returning();
      console.log(
        `[extraction] done id=${id} status=failed in ${(
          (Date.now() - startedAt) / 1000
        ).toFixed(1)}s error=${message}`,
      );
      return NextResponse.json({ extraction: failed }, { status: 500 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
