import { relations } from "drizzle-orm";
import { numeric, pgTable, text } from "drizzle-orm/pg-core";

import { auditTimeFields } from "./common.schema";
import { financialTransaction } from "./financial-transaction.schema";

export const transactionTransfer = pgTable("transaction_transfer", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fromTransactionId: text("from_transaction_id")
    .notNull()
    .references(() => financialTransaction.id, { onDelete: "cascade" }),
  toTransactionId: text("to_transaction_id")
    .notNull()
    .references(() => financialTransaction.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 19, scale: 4 }).notNull(),
  ...auditTimeFields,
});

export const transactionTransferRelations = relations(
  transactionTransfer,
  ({ one }) => ({
    fromTransaction: one(financialTransaction, {
      fields: [transactionTransfer.fromTransactionId],
      references: [financialTransaction.id],
      relationName: "transaction_transfer_to_from_transaction",
    }),
    toTransaction: one(financialTransaction, {
      fields: [transactionTransfer.toTransactionId],
      references: [financialTransaction.id],
      relationName: "transaction_transfer_to_to_transaction",
    }),
  }),
);
