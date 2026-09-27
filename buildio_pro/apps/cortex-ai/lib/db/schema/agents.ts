import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { toolboxes } from "./toolboxes";
import { topics } from "./topics";
import { workspaces } from "./workspaces";

export const agents = pgTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    instructions: text("instructions"),
    status: text("status", { enum: ["draft", "deployed", "undeployed"] })
      .notNull()
      .default("draft"),
    lastDeployedAt: timestamp("last_deployed_at", { withTimezone: true }),
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
    workspaceIdx: index("agents_workspace_idx").on(table.workspaceId),
    nameIdx: uniqueIndex("agents_workspace_name_idx")
      .on(table.workspaceId, table.name)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const agentTopics = pgTable(
  "agent_topics",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull()
      .$onUpdateFn(() => sql`now()`),
  },
  (table) => ({
    agentIdx: index("agent_topics_agent_idx").on(table.agentId),
    topicIdx: index("agent_topics_topic_idx").on(table.topicId),
    agentTopicIdx: uniqueIndex("agent_topics_agent_topic_idx").on(
      table.agentId,
      table.topicId,
    ),
  }),
);

export const agentTools = pgTable(
  "agent_tools",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    toolKey: text("tool_key"),
    toolboxId: text("toolbox_id").references(() => toolboxes.id, {
      onDelete: "cascade",
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
    agentIdx: index("agent_tools_agent_idx").on(table.agentId),
    toolboxIdx: index("agent_tools_toolbox_idx").on(table.toolboxId),
    toolOrToolboxCheck: check(
      "agent_tools_tool_or_toolbox_check",
      sql`(${table.toolKey} IS NOT NULL AND ${table.toolboxId} IS NULL) OR (${table.toolKey} IS NULL AND ${table.toolboxId} IS NOT NULL)`,
    ),
    agentToolKeyIdx: uniqueIndex("agent_tools_agent_tool_key_idx")
      .on(table.agentId, table.toolKey)
      .where(sql`${table.toolKey} IS NOT NULL`),
    agentToolboxIdx: uniqueIndex("agent_tools_agent_toolbox_idx")
      .on(table.agentId, table.toolboxId)
      .where(sql`${table.toolboxId} IS NOT NULL`),
  }),
);
