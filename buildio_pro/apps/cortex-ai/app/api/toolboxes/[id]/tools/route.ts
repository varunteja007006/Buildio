import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { isValidToolKey } from "@/lib/agents/tool-catalog";
import { db } from "@/lib/db";
import { toolboxes, toolboxTools } from "@/lib/db/schema/toolboxes";
import { getCurrentUser } from "@/lib/session";
import { getActiveWorkspace } from "@/lib/workspaces";

type Params = { params: Promise<{ id: string }> };

async function loadActiveToolbox(id: string, workspaceId: string) {
  const [toolbox] = await db
    .select({ id: toolboxes.id })
    .from(toolboxes)
    .where(
      and(
        eq(toolboxes.id, id),
        eq(toolboxes.workspaceId, workspaceId),
        isNull(toolboxes.deletedAt),
      ),
    )
    .limit(1);
  return toolbox ?? null;
}

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
    const toolbox = await loadActiveToolbox(id, workspace.id);
    if (!toolbox)
      return NextResponse.json({ error: "Toolbox not found" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const toolKeys: string[] = Array.isArray(body?.toolKeys)
      ? body.toolKeys.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [];
    const invalidKeys = toolKeys.filter((key) => !isValidToolKey(key));
    if (invalidKeys.length)
      return NextResponse.json(
        { error: `Unknown tools: ${invalidKeys.join(", ")}` },
        { status: 400 },
      );

    await db.transaction(async (tx) => {
      await tx.delete(toolboxTools).where(eq(toolboxTools.toolboxId, id));
      if (toolKeys.length)
        await tx
          .insert(toolboxTools)
          .values(toolKeys.map((toolKey) => ({ toolboxId: id, toolKey })));
    });

    const tools = await db
      .select({ toolKey: toolboxTools.toolKey })
      .from(toolboxTools)
      .where(eq(toolboxTools.toolboxId, id));
    return NextResponse.json({ toolKeys: tools.map((row) => row.toolKey) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
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
    const toolbox = await loadActiveToolbox(id, workspace.id);
    if (!toolbox)
      return NextResponse.json({ error: "Toolbox not found" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const toolKeys: string[] = Array.isArray(body?.toolKeys)
      ? body.toolKeys.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [];
    if (!toolKeys.length)
      return NextResponse.json(
        { error: "toolKeys is required" },
        { status: 400 },
      );
    const invalidKeys = toolKeys.filter((key) => !isValidToolKey(key));
    if (invalidKeys.length)
      return NextResponse.json(
        { error: `Unknown tools: ${invalidKeys.join(", ")}` },
        { status: 400 },
      );

    await db
      .insert(toolboxTools)
      .values(toolKeys.map((toolKey) => ({ toolboxId: id, toolKey })))
      .onConflictDoNothing();

    const tools = await db
      .select({ toolKey: toolboxTools.toolKey })
      .from(toolboxTools)
      .where(eq(toolboxTools.toolboxId, id));
    return NextResponse.json({ toolKeys: tools.map((row) => row.toolKey) });
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
    const toolbox = await loadActiveToolbox(id, workspace.id);
    if (!toolbox)
      return NextResponse.json({ error: "Toolbox not found" }, { status: 404 });

    const toolKey = request.nextUrl.searchParams.get("toolKey");
    if (!toolKey)
      return NextResponse.json(
        { error: "toolKey is required" },
        { status: 400 },
      );
    await db
      .delete(toolboxTools)
      .where(
        and(eq(toolboxTools.toolboxId, id), eq(toolboxTools.toolKey, toolKey)),
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
