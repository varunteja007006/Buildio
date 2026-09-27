import { sql } from "drizzle-orm";
import { text, timestamp, pgTable, index } from "drizzle-orm/pg-core";

import { agents } from "./agents";
import { user } from "./auth";
import { workspaces } from "./workspaces";

export const chatThreads = pgTable(
  "chat_threads",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** Agent this playground thread belongs to; null for normal chats. */
    agentId: text("agent_id").references(() => agents.id, {
      onDelete: "set null",
    }),
    title: text("title"),
    /** Model pinned to this conversation; falls back to the user default. */
    model: text("model"),
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
    userIdx: index("chat_threads_user_idx").on(table.userId),
    workspaceIdx: index("chat_threads_workspace_idx").on(table.workspaceId),
    agentIdx: index("chat_threads_agent_idx").on(table.agentId),
    userWorkspaceUpdatedAtIdx: index(
      "chat_threads_user_workspace_updated_at_idx",
    ).on(table.userId, table.workspaceId, table.updatedAt),
    userUpdatedAtIdx: index("chat_threads_user_updated_at_idx").on(
      table.userId,
      table.updatedAt,
    ),
  }),
);
