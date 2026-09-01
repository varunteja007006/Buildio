import { relations } from "drizzle-orm";
import { AnyPgColumn, pgTable, text } from "drizzle-orm/pg-core";

import { auditTimeFields } from "./common.schema";

export const expenseCategory = pgTable("expense_category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  parentId: text("parent_id").references(
    (): AnyPgColumn => expenseCategory.id,
    {
      onDelete: "set null",
    },
  ),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ...auditTimeFields,
});

export const expenseCategoryRelations = relations(
  expenseCategory,
  ({ many, one }) => ({
    parent: one(expenseCategory, {
      fields: [expenseCategory.parentId],
      references: [expenseCategory.id],
      relationName: "expense_category_to_parent",
    }),
    children: many(expenseCategory, {
      relationName: "expense_category_to_parent",
    }),
  }),
);
