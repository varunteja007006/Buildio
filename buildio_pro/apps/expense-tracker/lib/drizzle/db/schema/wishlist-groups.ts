import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { auditFields, auditTimelines } from "./common";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const wishlistGroups = pgTable("wishlist_groups", {
  id: integer(),
  name: varchar({
    length: 255,
  }),
  description: varchar({
    length: 500,
  }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  ...auditTimelines,
  ...auditFields,
});

export const wishlistGroupsRelations = relations(wishlistGroups, ({ one }) => ({
  user: one(user, {
    fields: [wishlistGroups.userId],
    references: [user.id],
  }),
  createdByUser: one(user, {
    fields: [wishlistGroups.createdBy],
    references: [user.id],
  }),
  updatedByUser: one(user, {
    fields: [wishlistGroups.updatedBy],
    references: [user.id],
  }),
  deletedByUser: one(user, {
    fields: [wishlistGroups.deletedBy],
    references: [user.id],
  }),
}));
