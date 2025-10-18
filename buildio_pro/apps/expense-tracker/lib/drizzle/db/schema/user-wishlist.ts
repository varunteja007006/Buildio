import { integer, numeric, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { auditFields, auditTimelines } from "./common";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const wishlistGroups = pgTable("wishlist_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({
    length: 255,
  }).notNull(),
  description: varchar({
    length: 500,
  }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  ...auditTimelines,
  ...auditFields,
});

export const wishlistGroupsRelations = relations(
  wishlistGroups,
  ({ one, many }) => ({
    wishlistItems: many(wishlistItems),
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
  })
);

export const wishlistTags = pgTable("wishlist_tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({
    length: 255,
  }).notNull(),
  ...auditTimelines,
  ...auditFields,
});

export const wishlistTagsRelations = relations(wishlistTags, ({ one }) => ({
  createdByUser: one(user, {
    fields: [wishlistTags.createdBy],
    references: [user.id],
  }),
  updatedByUser: one(user, {
    fields: [wishlistTags.updatedBy],
    references: [user.id],
  }),
  deletedByUser: one(user, {
    fields: [wishlistTags.deletedBy],
    references: [user.id],
  }),
}));

export const wishlistItems = pgTable("wishlist_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  wishlistGroupId: integer("wishlist_group_id")
    .notNull()
    .references(() => wishlistGroups.id, { onDelete: "cascade" }),
  name: varchar({
    length: 255,
  }).notNull(),
  cost: numeric({
    precision: 10,
    mode: "number",
  }).notNull(),
  currency: text().notNull(),
  notes: varchar({
    length: 2000,
  }),
  ...auditTimelines,
  ...auditFields,
});

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlistItemsGroupId: one(wishlistGroups, {
    fields: [wishlistItems.wishlistGroupId],
    references: [wishlistGroups.id],
  }),
  createdByUser: one(user, {
    fields: [wishlistItems.createdBy],
    references: [user.id],
  }),
  updatedByUser: one(user, {
    fields: [wishlistItems.updatedBy],
    references: [user.id],
  }),
  deletedByUser: one(user, {
    fields: [wishlistItems.deletedBy],
    references: [user.id],
  }),
}));

export const wishlistItemsTags = pgTable("wishlist_items_tags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  wishlistItemId: integer("wishlist_item_id")
    .notNull()
    .references(() => wishlistItems.id, { onDelete: "cascade" }),
  wishlistTagId: integer("wishlist_tag_id")
    .notNull()
    .references(() => wishlistTags.id, {
      onDelete: "cascade",
    }),
});

export const wishlistItemsTagsRelation = relations(
  wishlistItemsTags,
  ({ one }) => ({
    wishlistItem: one(wishlistItems, {
      fields: [wishlistItemsTags.wishlistItemId],
      references: [wishlistItems.id],
    }),
    wishlistTag: one(wishlistTags, {
      fields: [wishlistItemsTags.wishlistTagId],
      references: [wishlistTags.id],
    }),
  })
);
