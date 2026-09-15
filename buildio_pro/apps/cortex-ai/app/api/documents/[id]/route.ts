import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { extractions } from "@/lib/db/schema/extractions";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

const ACTIVE_JOB_STATUSES = ["pending", "processing"] as const;

export async function DELETE(_request: Request, { params }: Params) {
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

    const [running] = await db
      .select({ id: extractions.id })
      .from(extractions)
      .where(
        and(
          eq(extractions.documentId, id),
          inArray(extractions.status, [...ACTIVE_JOB_STATUSES]),
          isNull(extractions.deletedAt),
        ),
      )
      .limit(1);
    if (running)
      return NextResponse.json(
        { error: "An extraction is running for this document" },
        { status: 409 },
      );

    const [document] = await db
      .update(documents)
      .set({ deletedAt: sql`now()` })
      .where(
        and(
          eq(documents.id, id),
          eq(documents.workspaceId, workspace.id),
          isNull(documents.deletedAt),
        ),
      )
      .returning({ id: documents.id });
    if (!document)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
