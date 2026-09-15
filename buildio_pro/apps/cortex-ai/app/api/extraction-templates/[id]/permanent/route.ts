import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { extractionTemplates } from "@/lib/db/schema/extraction-templates";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceMembership } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const [existing] = await db
      .select({ workspaceId: extractionTemplates.workspaceId })
      .from(extractionTemplates)
      .where(eq(extractionTemplates.id, id))
      .limit(1);
    if (!existing)
      return NextResponse.json(
        { error: "Template not found" },
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
    const [deleted] = await db
      .delete(extractionTemplates)
      .where(
        and(
          eq(extractionTemplates.id, id),
          eq(extractionTemplates.workspaceId, existing.workspaceId),
        ),
      )
      .returning({ id: extractionTemplates.id });
    if (!deleted)
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
