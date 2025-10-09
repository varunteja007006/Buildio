import { pgTable, integer, text, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import { auditTimelines, auditFields } from "./common";

export const userPreferences = pgTable("user_preferences", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Preferences
  currency: text("currency").default("INR").notNull(),
  language: text("language").default("ENG").notNull(),
  theme: text("theme").default("system").notNull(), // 'light' | 'dark' | 'system'
  notificationsEnabled: boolean("notifications_enabled")
    .default(false)
    .notNull(),
  weeklySummary: boolean("weekly_summary").default(false).notNull(),

  // audit fields
  ...auditFields,
  ...auditTimelines,
});

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(user, {
      fields: [userPreferences.userId],
      references: [user.id],
    }),
    createdByUser: one(user, {
      fields: [userPreferences.createdBy],
      references: [user.id],
    }),
    updatedByUser: one(user, {
      fields: [userPreferences.updatedBy],
      references: [user.id],
    }),
    deletedByUser: one(user, {
      fields: [userPreferences.deletedBy],
      references: [user.id],
    }),
  })
);
