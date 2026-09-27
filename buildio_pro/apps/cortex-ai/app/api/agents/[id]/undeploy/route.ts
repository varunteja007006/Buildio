import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema/agents";
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
    const [agent] = await db
      .update(agents)
      .set({ status: "undeployed" })
      .where(
        and(
          eq(agents.id, id),
          eq(agents.workspaceId, workspace.id),
          isNull(agents.deletedAt),
          eq(agents.status, "deployed"),
        ),
      )
      .returning();
    if (!agent)
      return NextResponse.json(
        { error: "Deployed agent not found" },
        { status: 404 },
      );
    return NextResponse.json({ agent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
