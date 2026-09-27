import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { agents } from "./agents";
import { user } from "./auth";
import { chatMessages } from "./messages";
import { chatThreads } from "./threads";

export const agentFeedback = pgTable(
  "agent_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    agentId: text("agent_id")
      .notNull()
      .references(() => agents.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
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
    agentIdx: index("agent_feedback_agent_idx").on(table.agentId),
    ratingCheck: check(
      "agent_feedback_rating_check",
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`,
    ),
    agentUserIdx: uniqueIndex("agent_feedback_agent_user_idx")
      .on(table.agentId, table.userId)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const chatMessageFeedback = pgTable(
  "chat_message_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    messageId: text("message_id")
      .notNull()
      .references(() => chatMessages.id, { onDelete: "cascade" }),
    threadId: text("thread_id")
      .notNull()
      .references(() => chatThreads.id, { onDelete: "cascade" }),
    agentId: text("agent_id").references(() => agents.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: text("rating", { enum: ["up", "down"] }).notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull()
      .$onUpdateFn(() => sql`now()`),
  },
  (table) => ({
    messageIdx: uniqueIndex("chat_message_feedback_message_idx").on(
      table.messageId,
    ),
    agentIdx: index("chat_message_feedback_agent_idx").on(table.agentId),
  }),
);
