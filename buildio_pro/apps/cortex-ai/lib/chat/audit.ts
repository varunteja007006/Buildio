import type { GenerateTextEndEvent, UIMessage } from "ai";

import type { GuardrailResult } from "@/lib/chat/guardrail";
import { db } from "@/lib/db";
import { chatAuditLogs } from "@/lib/db/schema/chat-audit-logs";

export type ChatAuditInput = {
  userId: string;
  workspaceId: string;
  threadId?: string;
  model: string;
  userQuery: string;
  event: GenerateTextEndEvent;
  guardrail?: GuardrailResult;
};

/** Map a guardrail result onto audit-log columns. */
function guardrailColumns(guardrail?: GuardrailResult) {
  if (!guardrail) return {};
  return {
    guardrailChecked: guardrail.checked,
    guardrailFlagged: guardrail.flagged,
    guardrailBlocked: guardrail.blocked,
    guardrailSeverity: guardrail.severity,
    guardrailCategories: guardrail.categories,
    guardrailReason: guardrail.reason,
    guardrailModel: guardrail.model,
  };
}

function roundMilliseconds(value: number | undefined): number | null {
  return value == null ? null : Math.round(value);
}

/** Extract the text of the most recent user message. */
export function getLastUserQuery(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }
  return "";
}

/**
 * Persist an audit record for a completed chat turn.
 *
 * Fire-and-forget: callers should not await this or let failures break the
 * chat stream.
 */
export async function recordChatAudit(input: ChatAuditInput): Promise<void> {
  const { event } = input;
  const usage = event.usage;
  const performance = event.finalStep?.performance;
  const model = event.finalStep?.model;

  await db.insert(chatAuditLogs).values({
    userId: input.userId,
    workspaceId: input.workspaceId,
    threadId: input.threadId ?? null,
    model: model?.modelId ?? input.model,
    provider: model?.provider ?? null,
    finishReason: event.finishReason ?? null,
    rawFinishReason: event.rawFinishReason ?? null,
    userQuery: input.userQuery,
    responseText: event.text,
    inputTokens: usage?.inputTokens ?? null,
    outputTokens: usage?.outputTokens ?? null,
    totalTokens: usage?.totalTokens ?? null,
    cacheReadTokens: usage?.inputTokenDetails?.cacheReadTokens ?? null,
    cacheWriteTokens: usage?.inputTokenDetails?.cacheWriteTokens ?? null,
    reasoningTokens: usage?.outputTokenDetails?.reasoningTokens ?? null,
    textTokens: usage?.outputTokenDetails?.textTokens ?? null,
    timeToFirstOutputMs: roundMilliseconds(performance?.timeToFirstOutputMs),
    stepTimeMs: roundMilliseconds(performance?.stepTimeMs),
    responseTimeMs: roundMilliseconds(performance?.responseTimeMs),
    performance: performance ?? null,
    usage: usage ?? null,
    toolCalls: event.toolCalls ?? null,
    toolResults: event.toolResults ?? null,
    warnings: event.warnings ?? null,
    rawRequest: event.request ?? null,
    rawResponse: event.response ?? null,
    ...guardrailColumns(input.guardrail),
  });
}

/**
 * Persist an audit record for a turn refused by the guardrail (no model call).
 *
 * Fire-and-forget: callers should not await this or let failures break the
 * response.
 */
export async function recordBlockedChatAudit(input: {
  userId: string;
  workspaceId: string;
  threadId?: string;
  model: string;
  userQuery: string;
  guardrail: GuardrailResult;
}): Promise<void> {
  await db.insert(chatAuditLogs).values({
    userId: input.userId,
    workspaceId: input.workspaceId,
    threadId: input.threadId ?? null,
    model: input.model,
    userQuery: input.userQuery,
    responseText: null,
    finishReason: "guardrail-blocked",
    error: "guardrail_blocked",
    ...guardrailColumns(input.guardrail),
  });
}
