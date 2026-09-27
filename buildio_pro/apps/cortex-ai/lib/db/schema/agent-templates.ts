import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { workspaces } from "./workspaces";

export const agentInstructionTemplates = pgTable(
  "agent_instruction_templates",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    body: text("body").notNull(),
    createdBy: text("created_by").references(() => user.id, {
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
    workspaceIdx: index("agent_instruction_templates_workspace_idx").on(
      table.workspaceId,
    ),
    nameIdx: uniqueIndex("agent_instruction_templates_workspace_name_idx")
      .on(table.workspaceId, table.name)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);
