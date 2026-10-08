import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { recordDocumentAudit } from "@/lib/audit/document-audit";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import {
  deleteDocumentFiles,
  hardDeleteDocumentRows,
} from "@/lib/documents/permanent-delete";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceMembership } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

/**
 * H3: permanently delete a document (owner only) — hard-deletes its
 * extractions, resources, and embeddings plus its stored file. The
 * audit row (with the filename) is the only trace left behind.
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const [existing] = await db
      .select({
        workspaceId: documents.workspaceId,
        filename: documents.filename,
      })
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);
    if (!existing)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    const membership = await getWorkspaceMembership(
      user.id,
      existing.workspaceId,
    );
    if (!membership || membership.role !== "owner")
      return NextResponse.json(
        { error: "Owner access required" },
        { status: 403 },
      );

    const [file] = await db
      .select({ filepath: documents.filepath })
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);
    await hardDeleteDocumentRows([id]);
    await deleteDocumentFiles(file ? [file.filepath] : []);

    // F6: audit the permanent delete — the document row is gone, so the
    // audit row keeps its filename for traceability
    void recordDocumentAudit({
      userId: user.id,
      workspaceId: existing.workspaceId,
      action: "permanent_delete",
      documentIds: [id],
      templateSnapshot: { id, filename: existing.filename },
      status: "permanent_deleted",
    }).catch(console.error);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
