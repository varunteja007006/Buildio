import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { agentInstructionTemplates } from "@/lib/db/schema/agent-templates";
import { getCurrentUser } from "@/lib/session";
import { getWorkspaceMembership } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const [existing] = await db
      .select({ workspaceId: agentInstructionTemplates.workspaceId })
      .from(agentInstructionTemplates)
      .where(eq(agentInstructionTemplates.id, id))
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
      .delete(agentInstructionTemplates)
      .where(
        and(
          eq(agentInstructionTemplates.id, id),
          eq(agentInstructionTemplates.workspaceId, existing.workspaceId),
        ),
      )
      .returning({ id: agentInstructionTemplates.id });
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
