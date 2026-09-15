import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { extractions } from "./extractions";

/** Append-only: versions are never updated or deleted. */
export const extractionVersions = pgTable(
  "extraction_versions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    extractionId: text("extraction_id")
      .notNull()
      .references(() => extractions.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    /** ai | user */
    source: text("source").notNull(),
    content: text("content").notNull(),
    structuredOutput: jsonb("structured_output"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    extractionIdx: index("extraction_versions_extraction_idx").on(
      table.extractionId,
    ),
  }),
);
