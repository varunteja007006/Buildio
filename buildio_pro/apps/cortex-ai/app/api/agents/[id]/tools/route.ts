import { and, eq, inArray, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { isValidToolKey } from "@/lib/agents/tool-catalog";
import { db } from "@/lib/db";
import { agentTools, agents } from "@/lib/db/schema/agents";
import { toolboxes, toolboxTools } from "@/lib/db/schema/toolboxes";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
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
    const body = await request.json().catch(() => null);
    const toolKeys: string[] = Array.isArray(body?.toolKeys)
      ? body.toolKeys.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [];
    const toolboxIds: string[] = Array.isArray(body?.toolboxIds)
      ? body.toolboxIds.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [];

    const invalidKeys = toolKeys.filter((key) => !isValidToolKey(key));
    if (invalidKeys.length)
      return NextResponse.json(
        { error: `Unknown tools: ${invalidKeys.join(", ")}` },
        { status: 400 },
      );

    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(
        and(
          eq(agents.id, id),
          eq(agents.workspaceId, workspace.id),
          isNull(agents.deletedAt),
        ),
      )
      .limit(1);
    if (!agent)
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    // Toolbox ids must be active workspaces toolboxes.
    const validToolboxes = toolboxIds.length
      ? await db
          .select({ id: toolboxes.id })
          .from(toolboxes)
          .where(
            and(
              inArray(toolboxes.id, toolboxIds),
              eq(toolboxes.workspaceId, workspace.id),
              isNull(toolboxes.deletedAt),
            ),
          )
      : [];
    if (validToolboxes.length !== toolboxIds.length)
      return NextResponse.json(
        { error: "One or more toolboxes are invalid for this workspace" },
        { status: 400 },
      );

    // Exclusion rule: a tool that is a member of any active workspace toolbox
    // cannot be attached individually. Toolbox membership takes precedence, so
    // those keys are dropped from the individual selection.
    const memberKeys = await db
      .select({ toolKey: toolboxTools.toolKey })
      .from(toolboxTools)
      .innerJoin(toolboxes, eq(toolboxTools.toolboxId, toolboxes.id))
      .where(
        and(
          eq(toolboxes.workspaceId, workspace.id),
          isNull(toolboxes.deletedAt),
        ),
      );
    const toolboxMemberKeys = new Set(memberKeys.map((row) => row.toolKey));
    const attachableToolKeys = toolKeys.filter(
      (key) => !toolboxMemberKeys.has(key),
    );

    await db.transaction(async (tx) => {
      await tx.delete(agentTools).where(eq(agentTools.agentId, id));
      const rows = [
        ...attachableToolKeys.map((toolKey) => ({ agentId: id, toolKey })),
        ...validToolboxes.map((toolbox) => ({
          agentId: id,
          toolboxId: toolbox.id,
        })),
      ];
      if (rows.length) await tx.insert(agentTools).values(rows);
    });

    const attached = await db
      .select({ toolKey: agentTools.toolKey, toolboxId: agentTools.toolboxId })
      .from(agentTools)
      .where(eq(agentTools.agentId, id));
    return NextResponse.json({
      toolKeys: attached
        .map((row) => row.toolKey)
        .filter((value): value is string => value !== null),
      toolboxIds: attached
        .map((row) => row.toolboxId)
        .filter((value): value is string => value !== null),
      droppedToolKeys: toolKeys.filter((key) => toolboxMemberKeys.has(key)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
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
    const toolKey = request.nextUrl.searchParams.get("toolKey");
    const toolboxId = request.nextUrl.searchParams.get("toolboxId");
    if (!toolKey && !toolboxId)
      return NextResponse.json(
        { error: "toolKey or toolboxId is required" },
        { status: 400 },
      );

    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(
        and(
          eq(agents.id, id),
          eq(agents.workspaceId, workspace.id),
          isNull(agents.deletedAt),
        ),
      )
      .limit(1);
    if (!agent)
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    if (toolKey) {
      await db
        .delete(agentTools)
        .where(
          and(eq(agentTools.agentId, id), eq(agentTools.toolKey, toolKey)),
        );
    } else if (toolboxId) {
      await db
        .delete(agentTools)
        .where(
          and(eq(agentTools.agentId, id), eq(agentTools.toolboxId, toolboxId)),
        );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
