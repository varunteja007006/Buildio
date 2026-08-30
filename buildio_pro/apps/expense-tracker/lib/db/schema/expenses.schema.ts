import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { budget } from "./budget.schema";
import { expenseCategory } from "./categories.schema";
import { auditTimeFields } from "./common.schema";
import { financialTransaction } from "./financial-transaction.schema";

export const expense = pgTable("expense", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => financialTransaction.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => expenseCategory.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  budgetId: text("budget_id").references(() => budget.id, {
    onDelete: "set null",
  }),
  ...auditTimeFields,
});

export const expenseRelations = relations(expense, ({ one }) => ({
  user: one(user, {
    fields: [expense.userId],
    references: [user.id],
    relationName: "expense_to_user",
  }),
  category: one(expenseCategory, {
    fields: [expense.categoryId],
    references: [expenseCategory.id],
    relationName: "expense_to_category",
  }),
  budget: one(budget, {
    fields: [expense.budgetId],
    references: [budget.id],
    relationName: "expense_to_budget",
  }),
  transaction: one(financialTransaction, {
    fields: [expense.transactionId],
    references: [financialTransaction.id],
    relationName: "expense_to_transaction",
  }),
}));
