import { text, timestamp, boolean, pgTable, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { topics } from "./topics";
import { folders } from "./folders";
import { workspaces } from "./workspaces";

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    filepath: text("filepath").notNull(),
    fileHash: text("file_hash").notNull(),
    ingested: boolean("ingested").default(false).notNull(),
    topicId: text("topic_id").references(() => topics.id, {
      onDelete: "set null",
    }),
    folderId: text("folder_id").references(() => folders.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull()
      .$onUpdateFn(() => sql`now()`),
  },
  (table) => ({
    workspaceIdx: index("documents_workspace_idx").on(table.workspaceId),
    topicIdx: index("documents_topic_idx").on(table.topicId),
    folderIdx: index("documents_folder_idx").on(table.folderId),
  }),
);