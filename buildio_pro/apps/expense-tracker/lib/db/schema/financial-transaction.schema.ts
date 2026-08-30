import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { expenseCategory } from "./categories.schema";
import { auditTimeFields } from "./common.schema";
import { currency } from "./currency.schema";
import { paymentMethods } from "./payment.schema";
import { statementUpload } from "./statement.schema";
import { userBankAccount } from "./user-extended.schema";

export const transactionDirection = pgEnum("transaction_direction", [
  "debit",
  "credit",
]);

export const transactionType = pgEnum("transaction_type", [
  "expense",
  "income",
  "transfer",
  "investment",
  "loan_payment",
  "insurance",
  "refund",
  "interest",
  "fee",
  "cash_withdrawal",
  "round_up",
  "unknown",
]);

export const financialTransaction = pgTable(
  "financial_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bankAccountId: text("bank_account_id").references(
      () => userBankAccount.id,
      { onDelete: "set null" },
    ),
    statementUploadId: text("statement_upload_id").references(
      () => statementUpload.id,
      { onDelete: "set null" },
    ),
    transactionDate: timestamp("transaction_date").defaultNow().notNull(),
    amount: numeric("amount", { precision: 19, scale: 4 }).notNull(),
    currencyId: text("currency_id").references(() => currency.id, {
      onDelete: "set null",
    }),
    direction: transactionDirection("direction").notNull(),
    transactionType: transactionType("transaction_type")
      .default("unknown")
      .notNull(),
    merchantName: text("merchant_name"),
    counterpartyName: text("counterparty_name"),
    description: text("description"),
    rawDescription: text("raw_description"),
    referenceNumber: text("reference_number"),
    balanceAfter: numeric("balance_after", { precision: 19, scale: 4 }),
    paymentMethodId: text("payment_method_id").references(
      () => paymentMethods.id,
      { onDelete: "set null" },
    ),
    categoryId: text("category_id").references(() => expenseCategory.id, {
      onDelete: "set null",
    }),
    isRecurring: boolean("is_recurring").default(false).notNull(),
    isTransfer: boolean("is_transfer").default(false).notNull(),
    linkedTransactionId: text("linked_transaction_id").references(
      (): any => financialTransaction.id,
      { onDelete: "set null" },
    ),
    extractionConfidence: numeric("extraction_confidence", {
      precision: 5,
      scale: 4,
    }),
    reviewedAt: timestamp("reviewed_at"),
    transactionHash: text("transaction_hash"),
    ...auditTimeFields,
  },
  (table) => [
    uniqueIndex("financial_transaction_user_id_hash_uidx").on(
      table.userId,
      table.transactionHash,
    ),
    index("idx_financial_transaction_user_id").on(table.userId),
    index("idx_financial_transaction_bank_account_id").on(
      table.bankAccountId,
    ),
    index("idx_financial_transaction_statement_upload_id").on(
      table.statementUploadId,
    ),
    index("idx_financial_transaction_transaction_date").on(
      table.transactionDate,
    ),
    index("idx_financial_transaction_category_id").on(table.categoryId),
    index("idx_financial_transaction_payment_method_id").on(
      table.paymentMethodId,
    ),
  ],
);

export const financialTransactionRelations = relations(
  financialTransaction,
  ({ many, one }) => ({
    user: one(user, {
      fields: [financialTransaction.userId],
      references: [user.id],
      relationName: "financial_transaction_to_user",
    }),
    bankAccount: one(userBankAccount, {
      fields: [financialTransaction.bankAccountId],
      references: [userBankAccount.id],
      relationName: "financial_transaction_to_user_bank_account",
    }),
    statementUpload: one(statementUpload, {
      fields: [financialTransaction.statementUploadId],
      references: [statementUpload.id],
      relationName: "financial_transaction_to_statement_upload",
    }),
    currency: one(currency, {
      fields: [financialTransaction.currencyId],
      references: [currency.id],
      relationName: "financial_transaction_to_currency",
    }),
    paymentMethod: one(paymentMethods, {
      fields: [financialTransaction.paymentMethodId],
      references: [paymentMethods.id],
      relationName: "financial_transaction_to_payment_methods",
    }),
    category: one(expenseCategory, {
      fields: [financialTransaction.categoryId],
      references: [expenseCategory.id],
      relationName: "financial_transaction_to_expense_category",
    }),
    linkedTransaction: one(financialTransaction, {
      fields: [financialTransaction.linkedTransactionId],
      references: [financialTransaction.id],
      relationName: "financial_transaction_linked",
    }),
    linkedTransactions: many(financialTransaction, {
      relationName: "financial_transaction_linked",
    }),
  }),
);
