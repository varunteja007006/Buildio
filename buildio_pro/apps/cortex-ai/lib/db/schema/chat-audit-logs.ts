import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { chatThreads } from "./threads";
import { workspaces } from "./workspaces";

export const chatAuditLogs = pgTable(
  "chat_audit_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    threadId: text("thread_id").references(() => chatThreads.id, {
      onDelete: "set null",
    }),
    model: text("model"),
    provider: text("provider"),
    finishReason: text("finish_reason"),
    rawFinishReason: text("raw_finish_reason"),
    userQuery: text("user_query"),
    responseText: text("response_text"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    totalTokens: integer("total_tokens"),
    cacheReadTokens: integer("cache_read_tokens"),
    cacheWriteTokens: integer("cache_write_tokens"),
    reasoningTokens: integer("reasoning_tokens"),
    textTokens: integer("text_tokens"),
    timeToFirstOutputMs: integer("time_to_first_output_ms"),
    stepTimeMs: integer("step_time_ms"),
    responseTimeMs: integer("response_time_ms"),
    /** Full `StepResultPerformance` from the final step. */
    performance: jsonb("performance"),
    /** Full `LanguageModelUsage` aggregated across all steps. */
    usage: jsonb("usage"),
    toolCalls: jsonb("tool_calls"),
    toolResults: jsonb("tool_results"),
    warnings: jsonb("warnings"),
    /** Raw request metadata: messages sent + provider request body. */
    rawRequest: jsonb("raw_request"),
    /** Raw response metadata: response messages, headers, provider body. */
    rawResponse: jsonb("raw_response"),
    /** Whether the guardrail scanned this turn. */
    guardrailChecked: boolean("guardrail_checked").notNull().default(false),
    /** True when the guardrail flagged the query as risky. */
    guardrailFlagged: boolean("guardrail_flagged").notNull().default(false),
    /** True when the request was refused because of the guardrail. */
    guardrailBlocked: boolean("guardrail_blocked").notNull().default(false),
    /** Risk severity: none | low | medium | high | critical. */
    guardrailSeverity: text("guardrail_severity"),
    /** Risk categories reported by the guardrail. */
    guardrailCategories: jsonb("guardrail_categories"),
    /** Short explanation of why the query was flagged. */
    guardrailReason: text("guardrail_reason"),
    /** Model id used for the guardrail scan. */
    guardrailModel: text("guardrail_model"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    userIdx: index("chat_audit_logs_user_idx").on(table.userId),
    workspaceIdx: index("chat_audit_logs_workspace_idx").on(table.workspaceId),
    threadIdx: index("chat_audit_logs_thread_idx").on(table.threadId),
    createdAtIdx: index("chat_audit_logs_created_at_idx").on(table.createdAt),
  }),
);
