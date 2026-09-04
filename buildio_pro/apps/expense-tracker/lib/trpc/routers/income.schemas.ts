import z from "zod";

import { paginationInputSchema } from "../schemas/pagination.schema";

export const amountSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((value) => Number(value) > 0, {
    message: "Amount must be greater than zero",
  });

export const createIncomeInput = z.object({
  name: z.string().min(1, "Income name required").max(255),
  amount: amountSchema,
  sourceId: z.uuid().optional(),
});

export const updateIncomeInput = z
  .object({
    incomeId: z.uuid(),
    name: z.string().min(1).max(255).optional(),
    amount: amountSchema.optional(),
    sourceId: z.uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdatableField =
      data.name !== undefined ||
      data.amount !== undefined ||
      data.sourceId !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["incomeId"],
        message: "Provide at least one field to update",
      });
    }
  });

export const listIncomesInput = paginationInputSchema.extend({});

export const incomeIdInput = z.object({
  incomeId: z.uuid(),
});

export const bulkDeleteInput = z.object({
  incomeIds: z.array(z.uuid()).min(1, "At least one income ID is required"),
});

export const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export type IncomeRow = {
  income: typeof import("../../db/schema/income.schema").income.$inferSelect;
  transaction: typeof import("../../db/schema/financial-transaction.schema").financialTransaction.$inferSelect;
  source:
    | typeof import("../../db/schema/income.schema").incomeSource.$inferSelect
    | null;
};

export const toIncomeDto = (row: IncomeRow) => ({
  ...row.income,
  transaction: row.transaction,
  source: row.source,
  amount: numericToNumber(row.transaction.amount),
  transactionDate: row.transaction.transactionDate,
});
