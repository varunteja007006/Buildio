import z from "zod";

import { paginationInputSchema } from "../schemas/pagination.schema";

export const transactionTypeSchema = z.enum([
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

export const transactionIdInput = z.object({
  transactionId: z.uuid(),
});

export const bulkDeleteTransactionsInput = z.object({
  transactionIds: z.array(z.uuid()).min(1).max(500),
});

export const updateTransactionInput = z
  .object({
    transactionId: z.uuid(),
    merchantName: z.string().trim().max(255).nullable().optional(),
    counterpartyName: z.string().trim().max(255).nullable().optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    categoryId: z.uuid().nullable().optional(),
    paymentMethodId: z.uuid().nullable().optional(),
    transactionType: transactionTypeSchema.optional(),
    direction: z.enum(["debit", "credit"]).optional(),
    transactionDate: z.coerce.date().optional(),
    amount: z.coerce.number().positive("Amount must be positive").optional(),
    referenceNumber: z.string().trim().max(255).nullable().optional(),
    isRecurring: z.boolean().optional(),
    isTransfer: z.boolean().optional(),
    isEmi: z.boolean().optional(),
    emiInstallmentNumber: z.number().int().nullable().optional(),
    emiTotalInstallments: z.number().int().nullable().optional(),
    international: z.boolean().optional(),
    rewardPoints: z.coerce.number().nullable().optional(),
    balanceAfter: z.coerce.number().nullable().optional(),
  })
  .refine(
    (data) =>
      Object.entries(data).some(
        ([key, value]) => key !== "transactionId" && value !== undefined,
      ),
    { message: "Provide at least one field to update" },
  );

export const listTransactionsInput = paginationInputSchema.extend({
  bankAccountId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  paymentMethodId: z.uuid().optional(),
  statementUploadId: z.uuid().optional(),
  direction: z.enum(["debit", "credit"]).optional(),
  transactionType: transactionTypeSchema.optional(),
  search: z.string().trim().max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  markForReviewOnly: z.boolean().default(false),
});

export const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};
