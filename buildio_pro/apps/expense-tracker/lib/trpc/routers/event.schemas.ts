import z from "zod";

import { zodSchema } from "@/lib/db/zod-schema";

import { paginationInputSchema } from "../schemas/pagination.schema";

export function numericToNumber(
  value: string | number | null | undefined,
): number {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const estimatedBudgetSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((val) => !val || Number(val) >= 0, {
    message: "Estimated budget must be a positive number",
  })
  .optional();

export const createEventInput = z
  .object({
    name: zodSchema.createEventSchema.shape.name,
    description: zodSchema.createEventSchema.shape.description,
    estimatedBudget: estimatedBudgetSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    statusId: zodSchema.createEventSchema.shape.statusId,
  })
  .superRefine((data, ctx) => {
    if (data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  });

export const updateEventInput = z
  .object({
    eventId: z.uuid(),
    name: zodSchema.updateEventSchema.shape.name,
    description: zodSchema.updateEventSchema.shape.description,
    estimatedBudget: estimatedBudgetSchema,
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    statusId: zodSchema.createEventSchema.shape.statusId,
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }

    const hasUpdatableField =
      data.name !== undefined ||
      data.description !== undefined ||
      data.estimatedBudget !== undefined ||
      data.startDate !== undefined ||
      data.endDate !== undefined ||
      data.statusId !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["eventId"],
        message: "Provide at least one field to update",
      });
    }
  });

export const listEventsInput = paginationInputSchema.extend({
  statusId: z.uuid().optional(),
});

export const eventIdInput = z.object({
  eventId: z.uuid(),
});

export const addExpenseToEventInput = z.object({
  eventId: z.uuid(),
  expenseId: z.uuid(),
});

export const removeExpenseFromEventInput = z.object({
  eventId: z.uuid(),
  expenseId: z.uuid(),
});
