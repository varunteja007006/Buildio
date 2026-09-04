import z from "zod";

import { zodSchema } from "@/lib/db/zod-schema";

import { paginationInputSchema } from "../schemas/pagination.schema";

export const budgetAmountSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((value) => Number(value) > 0, {
    message: "Budget amount must be greater than zero",
  });

export const createBudgetInput = z
  .object({
    name: zodSchema.createBudgetSchema.shape.name,
    description: zodSchema.createBudgetSchema.shape.description,
    budgetAmount: budgetAmountSchema,
    startMonth: z.coerce.date(),
    endMonth: z.coerce.date(),
  })
  .superRefine((data, ctx) => {
    if (data.endMonth <= data.startMonth) {
      ctx.addIssue({
        code: "custom",
        path: ["endMonth"],
        message: "End month must be after start month",
      });
    }
  });

export const updateBudgetInput = z
  .object({
    budgetId: z.uuid(),
    name: zodSchema.updateBudgetSchema.shape.name,
    description: zodSchema.updateBudgetSchema.shape.description,
    budgetAmount: budgetAmountSchema.optional(),
    startMonth: z.coerce.date().optional(),
    endMonth: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startMonth && data.endMonth && data.endMonth <= data.startMonth) {
      ctx.addIssue({
        code: "custom",
        path: ["endMonth"],
        message: "End month must be after start month",
      });
    }

    const hasUpdatableField =
      data.name !== undefined ||
      data.description !== undefined ||
      data.budgetAmount !== undefined ||
      data.startMonth !== undefined ||
      data.endMonth !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["budgetId"],
        message: "Provide at least one field to update",
      });
    }
  });

export const listBudgetInput = paginationInputSchema.extend({
  onlyActive: z.boolean().default(false),
});

export const budgetIdInput = z.object({
  budgetId: z.uuid(),
});
