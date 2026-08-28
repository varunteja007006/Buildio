import {
  text,
  timestamp,
  boolean,
  integer,
  pgTable,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { workspaces } from "./workspaces";
import { user } from "./auth";

export const workspaceMembers = pgTable(
  "workspace_members",
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
    role: text("role", { enum: ["owner", "member"] }).notNull().default("member"),
    /** The active workspace for this user. Only one membership per user is active. */
    isActive: boolean("is_active").notNull().default(false),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull()
      .$onUpdateFn(() => sql`now()`),
  },
  (table) => ({
    userIdx: index("workspace_members_user_idx").on(table.userId),
    workspaceIdx: index("workspace_members_workspace_idx").on(table.workspaceId),
    userWorkspaceUq: uniqueIndex("workspace_members_user_workspace_uq").on(
      table.userId,
      table.workspaceId,
    ),
  }),
);