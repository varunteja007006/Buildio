import { relations } from "drizzle-orm";
import { pgTable, text } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { auditTimeFields } from "./common.schema";
import { financialTransaction } from "./financial-transaction.schema";

export const incomeSource = pgTable("income_source", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  ...auditTimeFields,
});

export const income = pgTable("income", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => financialTransaction.id, { onDelete: "cascade" }),
  name: text("name"),
  sourceId: text("source_id").references(() => incomeSource.id, {
    onDelete: "set null",
  }),
  ...auditTimeFields,
});

export const incomeSourceRelations = relations(incomeSource, ({ many }) => ({
  incomes: many(income),
}));

export const incomeRelations = relations(income, ({ one }) => ({
  user: one(user, {
    fields: [income.userId],
    references: [user.id],
    relationName: "income_to_user",
  }),
  source: one(incomeSource, {
    fields: [income.sourceId],
    references: [incomeSource.id],
    relationName: "income_to_source",
  }),
  transaction: one(financialTransaction, {
    fields: [income.transactionId],
    references: [financialTransaction.id],
    relationName: "income_to_transaction",
  }),
}));
