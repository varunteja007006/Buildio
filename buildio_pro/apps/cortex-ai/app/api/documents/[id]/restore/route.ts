import { and, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { recordDocumentAudit } from "@/lib/audit/document-audit";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { restoreDocumentChildren } from "@/lib/documents/document-cascade";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

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
    // H6: un-delete the document plus the children trashed in the same
    // cascade batch; rows deleted on their own keep their deleted state.
    const document = await db.transaction(async (tx) => {
      const [trashed] = await tx
        .select({ id: documents.id, deletedBatchId: documents.deletedBatchId })
        .from(documents)
        .where(
          and(
            eq(documents.id, id),
            eq(documents.workspaceId, workspace.id),
            isNotNull(documents.deletedAt),
          ),
        )
        .limit(1);
      if (!trashed) return null;
      const [restored] = await tx
        .update(documents)
        .set({ deletedAt: null, deletedBatchId: null })
        .where(eq(documents.id, id))
        .returning();
      if (trashed.deletedBatchId) {
        await restoreDocumentChildren(
          tx,
          [id],
          trashed.deletedBatchId,
        );
      }
      return restored;
    });
    if (!document)
      return NextResponse.json(
        { error: "Deleted document not found" },
        { status: 404 },
      );

    // F6: audit the restore
    void recordDocumentAudit({
      userId: user.id,
      workspaceId: workspace.id,
      action: "restore",
      documentIds: [id],
      status: "restored",
    }).catch(console.error);

    return NextResponse.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
