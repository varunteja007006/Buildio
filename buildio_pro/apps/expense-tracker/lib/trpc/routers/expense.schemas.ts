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

export const createExpenseInput = z.object({
  name: z.string().min(1, "Expense name required").max(255),
  amount: amountSchema,
  categoryId: z.uuid().optional(),
  budgetId: z.uuid().optional(),
  isRecurring: z.boolean().default(false),
});

export const updateExpenseInput = z
  .object({
    expenseId: z.uuid(),
    name: z.string().min(1).max(255).optional(),
    amount: amountSchema.optional(),
    categoryId: z.uuid().nullable().optional(),
    budgetId: z.uuid().nullable().optional(),
    isRecurring: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdatableField =
      data.name !== undefined ||
      data.amount !== undefined ||
      data.categoryId !== undefined ||
      data.budgetId !== undefined ||
      data.isRecurring !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["expenseId"],
        message: "Provide at least one field to update",
      });
    }
  });

export const listExpensesInput = paginationInputSchema.extend({
  categoryId: z.uuid().optional(),
  budgetId: z.uuid().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const expenseIdInput = z.object({
  expenseId: z.uuid(),
});

export const bulkDeleteInput = z.object({
  expenseIds: z.array(z.uuid()).min(1, "At least one expense ID is required"),
});

export const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export type ExpenseRow = {
  expense: typeof import("../../db/schema/expenses.schema").expense.$inferSelect;
  transaction: typeof import("../../db/schema/financial-transaction.schema").financialTransaction.$inferSelect;
  category:
    | typeof import("../../db/schema/categories.schema").expenseCategory.$inferSelect
    | null;
  budget:
    typeof import("../../db/schema/budget.schema").budget.$inferSelect | null;
};

export const toExpenseDto = (row: ExpenseRow) => ({
  ...row.expense,
  transaction: row.transaction,
  category: row.category,
  budget: row.budget,
  amount: numericToNumber(row.transaction.amount),
  transactionDate: row.transaction.transactionDate,
});
