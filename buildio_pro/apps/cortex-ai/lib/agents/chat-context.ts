import { and, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { agentTopics, agentTools, agents } from "@/lib/db/schema/agents";
import { toolboxes, toolboxTools } from "@/lib/db/schema/toolboxes";
import { topics } from "@/lib/db/schema/topics";

export type AgentChatContext = {
  agentId: string;
  name: string;
  instructions: string;
  topicIds: string[];
  toolKeys: string[];
};

/**
 * Resolves the runtime chat context for an agent: its instructions, the
 * active topics attached to it, and the effective tool set (individual tools
 * plus tools from attached active toolboxes). Soft-deleted or detached
 * resources are silently excluded — resolution happens at request time.
 */
export async function getAgentChatContext(
  agentId: string,
  workspaceId: string,
): Promise<AgentChatContext | null> {
  const [agent] = await db
    .select({
      id: agents.id,
      name: agents.name,
      instructions: agents.instructions,
    })
    .from(agents)
    .where(
      and(
        eq(agents.id, agentId),
        eq(agents.workspaceId, workspaceId),
        isNull(agents.deletedAt),
      ),
    )
    .limit(1);
  if (!agent) return null;

  const topicRows = await db
    .select({ topicId: agentTopics.topicId })
    .from(agentTopics)
    .innerJoin(topics, eq(agentTopics.topicId, topics.id))
    .where(and(eq(agentTopics.agentId, agentId), isNull(topics.deletedAt)));

  const toolRows = await db
    .select({ toolKey: agentTools.toolKey, toolboxId: agentTools.toolboxId })
    .from(agentTools)
    .where(eq(agentTools.agentId, agentId));
  const toolKeys = toolRows
    .map((row) => row.toolKey)
    .filter((value): value is string => value !== null);
  const toolboxIds = toolRows
    .map((row) => row.toolboxId)
    .filter((value): value is string => value !== null);

  const activeToolboxIds = toolboxIds.length
    ? (
        await db
          .select({ id: toolboxes.id })
          .from(toolboxes)
          .where(
            and(
              inArray(toolboxes.id, toolboxIds),
              eq(toolboxes.workspaceId, workspaceId),
              isNull(toolboxes.deletedAt),
            ),
          )
      ).map((row) => row.id)
    : [];

  const toolboxToolKeys = activeToolboxIds.length
    ? (
        await db
          .select({ toolKey: toolboxTools.toolKey })
          .from(toolboxTools)
          .where(inArray(toolboxTools.toolboxId, activeToolboxIds))
      ).map((row) => row.toolKey)
    : [];

  return {
    agentId: agent.id,
    name: agent.name,
    instructions: agent.instructions ?? "",
    topicIds: [...new Set(topicRows.map((row) => row.topicId))],
    toolKeys: [...new Set([...toolKeys, ...toolboxToolKeys])],
  };
}
