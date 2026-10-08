import { and, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { recordDocumentAudit } from "@/lib/audit/document-audit";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import {
  deleteDocumentFiles,
  hardDeleteDocumentRows,
} from "@/lib/documents/permanent-delete";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace, getWorkspaceMembership } from "@/lib/workspaces";

/**
 * Empty trash (H8): permanently delete every trashed document in the
 * workspace (owner only), including their extractions, resources,
 * embeddings and their stored files.
 */
export async function DELETE() {
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
    const membership = await getWorkspaceMembership(user.id, workspace.id);
    if (!membership || membership.role !== "owner")
      return NextResponse.json(
        { error: "Owner access required" },
        { status: 403 },
      );

    const trashed = await db
      .select({ id: documents.id, filepath: documents.filepath })
      .from(documents)
      .where(
        and(
          eq(documents.workspaceId, workspace.id),
          isNotNull(documents.deletedAt),
        ),
      );
    if (trashed.length === 0)
      return NextResponse.json({ success: true, deleted: 0 });

    await hardDeleteDocumentRows(trashed.map((doc) => doc.id));
    await deleteDocumentFiles(trashed.map((doc) => doc.filepath));
    void recordDocumentAudit({
      userId: user.id,
      workspaceId: workspace.id,
      action: "permanent_delete",
      documentIds: trashed.map((doc) => doc.id),
      usage: { emptiedTrash: trashed.length },
      status: "permanent_deleted",
    }).catch(console.error);

    return NextResponse.json({ success: true, deleted: trashed.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
