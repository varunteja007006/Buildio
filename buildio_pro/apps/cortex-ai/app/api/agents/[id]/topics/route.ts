import { and, eq, inArray, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { agentTopics, agents } from "@/lib/db/schema/agents";
import { topics } from "@/lib/db/schema/topics";
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
    const topicIds = Array.isArray(body?.topicIds)
      ? body.topicIds.filter(
          (value: unknown): value is string => typeof value === "string",
        )
      : [];
    if (!topicIds.length)
      return NextResponse.json(
        { error: "topicIds is required" },
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

    const validTopics = await db
      .select({ id: topics.id })
      .from(topics)
      .where(
        and(
          inArray(topics.id, topicIds),
          eq(topics.workspaceId, workspace.id),
          isNull(topics.deletedAt),
        ),
      );
    if (validTopics.length !== topicIds.length)
      return NextResponse.json(
        { error: "One or more topics are invalid for this workspace" },
        { status: 400 },
      );

    await db.transaction(async (tx) => {
      await tx.delete(agentTopics).where(eq(agentTopics.agentId, id));
      await tx.insert(agentTopics).values(
        validTopics.map((topic) => ({ agentId: id, topicId: topic.id })),
      );
    });

    const attached = await db
      .select({ topicId: agentTopics.topicId })
      .from(agentTopics)
      .where(eq(agentTopics.agentId, id));
    return NextResponse.json({
      topicIds: attached.map((row) => row.topicId),
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
    const topicId = request.nextUrl.searchParams.get("topicId");
    if (!topicId)
      return NextResponse.json(
        { error: "topicId is required" },
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

    await db
      .delete(agentTopics)
      .where(
        and(eq(agentTopics.agentId, id), eq(agentTopics.topicId, topicId)),
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
