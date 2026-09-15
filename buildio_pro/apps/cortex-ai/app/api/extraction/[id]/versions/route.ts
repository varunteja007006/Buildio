import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { extractionVersions } from "@/lib/db/schema/extraction-versions";
import { extractions } from "@/lib/db/schema/extractions";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

const MAX_VERSIONS = 100;

/** List an extraction's immutable versions (newest first). */
export async function GET(_request: Request, { params }: Params) {
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

    // Ownership: the extraction must belong to a workspace document.
    const [owned] = await db
      .select({ id: extractions.id })
      .from(extractions)
      .innerJoin(documents, eq(extractions.documentId, documents.id))
      .where(
        and(eq(extractions.id, id), eq(documents.workspaceId, workspace.id)),
      )
      .limit(1);
    if (!owned)
      return NextResponse.json(
        { error: "Extraction not found" },
        { status: 404 },
      );

    const versions = await db
      .select({
        id: extractionVersions.id,
        extractionId: extractionVersions.extractionId,
        version: extractionVersions.version,
        source: extractionVersions.source,
        content: extractionVersions.content,
        structuredOutput: extractionVersions.structuredOutput,
        createdBy: extractionVersions.createdBy,
        createdAt: extractionVersions.createdAt,
      })
      .from(extractionVersions)
      .where(eq(extractionVersions.extractionId, id))
      .orderBy(desc(extractionVersions.version))
      .limit(MAX_VERSIONS);

    return NextResponse.json({ versions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
