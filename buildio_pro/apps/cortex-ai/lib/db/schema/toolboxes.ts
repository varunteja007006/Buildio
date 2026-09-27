import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { workspaces } from "./workspaces";

export const toolboxes = pgTable(
  "toolboxes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
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
    workspaceIdx: index("toolboxes_workspace_idx").on(table.workspaceId),
    nameIdx: uniqueIndex("toolboxes_workspace_name_idx")
      .on(table.workspaceId, table.name)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const toolboxTools = pgTable(
  "toolbox_tools",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    toolboxId: text("toolbox_id")
      .notNull()
      .references(() => toolboxes.id, { onDelete: "cascade" }),
    toolKey: text("tool_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull()
      .$onUpdateFn(() => sql`now()`),
  },
  (table) => ({
    toolboxIdx: index("toolbox_tools_toolbox_idx").on(table.toolboxId),
    toolboxToolKeyIdx: uniqueIndex("toolbox_tools_toolbox_key_idx").on(
      table.toolboxId,
      table.toolKey,
    ),
  }),
);
