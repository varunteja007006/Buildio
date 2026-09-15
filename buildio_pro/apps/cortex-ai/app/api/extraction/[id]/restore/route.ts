import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { extractions } from "@/lib/db/schema/extractions";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

/** Restore a soft-deleted extraction. */
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

    const [existing] = await db
      .select({ id: extractions.id })
      .from(extractions)
      .innerJoin(documents, eq(extractions.documentId, documents.id))
      .where(
        and(
          eq(extractions.id, id),
          eq(documents.workspaceId, workspace.id),
          // No deletedAt filter: restoring targets soft-deleted rows.
          sql`${extractions.deletedAt} is not null`,
        ),
      )
      .limit(1);
    if (!existing)
      return NextResponse.json(
        { error: "Extraction not found" },
        { status: 404 },
      );

    const [extraction] = await db
      .update(extractions)
      .set({ deletedAt: null })
      .where(eq(extractions.id, id))
      .returning();
    return NextResponse.json({ extraction });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
