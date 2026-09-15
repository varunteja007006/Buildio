import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { documents } from "./documents";
import { extractionTemplates } from "./extraction-templates";
import { resources } from "./resources";

export const extractions = pgTable(
  "extractions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    templateId: text("template_id").references(() => extractionTemplates.id, {
      onDelete: "set null",
    }),
    templateSnapshot: jsonb("template_snapshot"),
    model: text("model"),
    provider: text("provider"),
    /** pending | processing | completed | failed */
    status: text("status").notNull().default("pending"),
    rawOutput: text("raw_output"),
    currentContent: text("current_content"),
    structuredOutput: jsonb("structured_output"),
    error: text("error"),
    usage: jsonb("usage"),
    autoIngest: boolean("auto_ingest").notNull().default(false),
    /** Set by the reviewer; ingestion (E2) consumes the latest approved version */
    approved: boolean("approved").notNull().default(false),
    resourceId: text("resource_id").references(() => resources.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull()
      .$onUpdateFn(() => sql`now()`),
  },
  (table) => ({
    documentIdx: index("extractions_document_idx").on(table.documentId),
    templateIdx: index("extractions_template_idx").on(table.templateId),
    statusIdx: index("extractions_status_idx").on(table.status),
  }),
);
