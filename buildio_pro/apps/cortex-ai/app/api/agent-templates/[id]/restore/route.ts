import { and, eq, isNotNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { agentInstructionTemplates } from "@/lib/db/schema/agent-templates";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
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
    const [template] = await db
      .update(agentInstructionTemplates)
      .set({ deletedAt: null })
      .where(
        and(
          eq(agentInstructionTemplates.id, id),
          eq(agentInstructionTemplates.workspaceId, workspace.id),
          isNotNull(agentInstructionTemplates.deletedAt),
        ),
      )
      .returning();
    if (!template)
      return NextResponse.json(
        { error: "Deleted template not found" },
        { status: 404 },
      );
    return NextResponse.json({ template });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
