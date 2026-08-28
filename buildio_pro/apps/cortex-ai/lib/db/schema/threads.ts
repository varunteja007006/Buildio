import { text, timestamp, pgTable, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
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
    title: text("title"),
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
    userWorkspaceUpdatedAtIdx: index(
      "chat_threads_user_workspace_updated_at_idx",
    ).on(table.userId, table.workspaceId, table.updatedAt),
    userUpdatedAtIdx: index("chat_threads_user_updated_at_idx").on(
      table.userId,
      table.updatedAt,
    ),
  }),
);
