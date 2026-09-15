import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { extractions } from "./extractions";

/** Immutable audit log — rows are never updated or deleted. */
export const documentAuditLogs = pgTable(
  "document_audit_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // Deliberately no FK: audit rows must survive workspace (and user)
    // deletion — deleting a workspace must never wipe its audit history.
    workspaceId: text("workspace_id").notNull(),
    /** extract | ingest | delete | restore | permanent_delete | template_create | template_update | template_delete */
    action: text("action").notNull(),
    documentIds: jsonb("document_ids"),
    extractionId: text("extraction_id").references(() => extractions.id, {
      onDelete: "set null",
    }),
    templateSnapshot: jsonb("template_snapshot"),
    instructionsSnapshot: text("instructions_snapshot"),
    rawAiOutput: text("raw_ai_output"),
    finalOutput: text("final_output"),
    model: text("model"),
    provider: text("provider"),
    usage: jsonb("usage"),
    /** Wall-clock duration of the audited operation, in milliseconds. */
    durationMs: integer("duration_ms"),
    status: text("status"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    userIdx: index("document_audit_logs_user_idx").on(table.userId),
    workspaceIdx: index("document_audit_logs_workspace_idx").on(
      table.workspaceId,
    ),
    extractionIdx: index("document_audit_logs_extraction_idx").on(
      table.extractionId,
    ),
    createdAtIdx: index("document_audit_logs_created_at_idx").on(
      table.createdAt,
    ),
  }),
);
