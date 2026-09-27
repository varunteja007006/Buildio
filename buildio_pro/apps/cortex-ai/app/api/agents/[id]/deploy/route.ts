import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { agentTools, agents } from "@/lib/db/schema/agents";
import { agentTopics } from "@/lib/db/schema/agents";
import { chatMessages } from "@/lib/db/schema/messages";
import { chatThreads } from "@/lib/db/schema/threads";
import { toolboxes } from "@/lib/db/schema/toolboxes";
import { topics } from "@/lib/db/schema/topics";
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
      .select()
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
    if (agent.status === "deployed")
      return NextResponse.json(
        { error: "Agent is already deployed" },
        { status: 409 },
      );

    const topicCount = await db
      .select({ id: agentTopics.id })
      .from(agentTopics)
      .innerJoin(topics, eq(agentTopics.topicId, topics.id))
      .where(and(eq(agentTopics.agentId, id), isNull(topics.deletedAt)));
    const toolRows = await db
      .select({
        toolKey: agentTools.toolKey,
        toolboxId: agentTools.toolboxId,
      })
      .from(agentTools)
      .where(eq(agentTools.agentId, id));
    const toolboxIds = toolRows
      .map((row) => row.toolboxId)
      .filter((value): value is string => value !== null);
    const activeToolboxes = toolboxIds.length
      ? await db
          .select({ id: toolboxes.id })
          .from(toolboxes)
          .where(
            and(
              eq(toolboxes.workspaceId, workspace.id),
              isNull(toolboxes.deletedAt),
            ),
          )
      : [];
    const activeToolboxIds = new Set(activeToolboxes.map((row) => row.id));
    const resolvableToolKeys = toolRows
      .map((row) => row.toolKey)
      .filter((value): value is string => value !== null).length;
    const resolvableToolboxes = toolboxIds.filter((toolboxId) =>
      activeToolboxIds.has(toolboxId),
    ).length;

    if (!topicCount.length)
      return NextResponse.json(
        { error: "Attach at least one topic before deploying" },
        { status: 400 },
      );
    if (!resolvableToolKeys && !resolvableToolboxes)
      return NextResponse.json(
        { error: "Attach at least one tool or toolbox before deploying" },
        { status: 400 },
      );
    if (!agent.instructions?.trim())
      return NextResponse.json(
        { error: "Add instructions before deploying" },
        { status: 400 },
      );

    // Playground test-run gate: the agent must have at least one assistant
    // reply in an agent-bound (playground) thread against its current config.
    const [playgroundRun] = await db
      .select({ id: chatMessages.id })
      .from(chatMessages)
      .innerJoin(chatThreads, eq(chatMessages.threadId, chatThreads.id))
      .where(
        and(
          eq(chatThreads.agentId, id),
          isNull(chatThreads.deletedAt),
          eq(chatMessages.role, "assistant"),
        ),
      )
      .limit(1);
    if (!playgroundRun)
      return NextResponse.json(
        {
          error:
            "Run the agent in the playground at least once before deploying",
        },
        { status: 400 },
      );

    const [agentUpdated] = await db
      .update(agents)
      .set({ status: "deployed", lastDeployedAt: sql`now()` })
      .where(and(eq(agents.id, id), isNull(agents.deletedAt)))
      .returning();

    return NextResponse.json({ agent: agentUpdated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
