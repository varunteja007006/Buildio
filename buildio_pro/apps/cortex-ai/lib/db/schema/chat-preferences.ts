import { sql } from "drizzle-orm";
import { text, timestamp, pgTable } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { getDefaultChatModelId } from "../../chat/models";

/**
 * Per-user chat settings. One row per user, created lazily with the app
 * default model when the user first interacts with chat settings.
 */
export const chatPreferences = pgTable("chat_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  defaultModel: text("default_model")
    .notNull()
    // Runtime default from CHAT_DEFAULT_MODEL — no model id is baked into DDL.
    .$defaultFn(() => getDefaultChatModelId()),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull()
    .$onUpdateFn(() => sql`now()`),
});
