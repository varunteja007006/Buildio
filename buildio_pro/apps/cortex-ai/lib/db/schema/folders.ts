import {
  text,
  timestamp,
  integer,
  pgTable,
  index,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { topics } from "./topics";
import { workspaces } from "./workspaces";

export const folders = pgTable(
  "folders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    parentFolderId: text("parent_folder_id").references(
      (): AnyPgColumn => folders.id,
      { onDelete: "cascade" },
    ),
    name: text("name").notNull(),
    depth: integer("depth").notNull().default(0),
    position: integer("position").notNull().default(0),
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
    workspaceIdx: index("folders_workspace_idx").on(table.workspaceId),
    topicIdx: index("folders_topic_idx").on(table.topicId),
    parentIdx: index("folders_parent_idx").on(table.parentFolderId),
    depthCheck: check("folders_depth_check", sql`${table.depth} BETWEEN 0 AND 5`),
  }),
);
