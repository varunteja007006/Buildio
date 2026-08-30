import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import {
  financialTransaction,
  transactionDirection,
  transactionType,
} from "../schema/financial-transaction.schema";

export const transactionDirectionValues = transactionDirection.enumValues;
export const transactionTypeValues = transactionType.enumValues;

export const createFinancialTransactionSchema =
  createInsertSchema(financialTransaction).omit({
    userId: true,
  });

export const updateFinancialTransactionSchema = createUpdateSchema(
  financialTransaction,
).omit({
  userId: true,
});

export const selectFinancialTransactionSchema =
  createSelectSchema(financialTransaction);
