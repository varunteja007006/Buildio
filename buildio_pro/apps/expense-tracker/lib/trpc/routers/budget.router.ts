import { TRPCError } from "@trpc/server";
import { and, count, eq, gte, lte } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";

import { zodSchema } from "@/lib/db/zod-schema";

const budgetAmountSchema = z
  .union([z.string(), z.number()])
  .transform((value) => (typeof value === "number" ? value.toString() : value.trim()))
  .refine((value) => Number(value) > 0, {
    message: "Budget amount must be greater than zero",
  });

const createBudgetInput = z
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

const updateBudgetInput = z
  .object({
    budgetId: z.string().uuid(),
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

const listBudgetInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  onlyActive: z.boolean().default(false),
});

const budgetIdInput = z.object({
  budgetId: z.string().uuid(),
});

const numericToNumber = (value: string | number | null) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const budgetRouter = createTRPCRouter({
  budgetList: protectedProcedure
    .input(listBudgetInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { limit, offset, onlyActive } = input;

      const filters = [eq(dbSchema.budget.userId, user.id)];
      const now = new Date();

      if (onlyActive) {
        filters.push(lte(dbSchema.budget.startMonth, now));
        filters.push(gte(dbSchema.budget.endMonth, now));
      }

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.budget)
        .where(whereClause);

      const budgets = await db.query.budget.findMany({
        limit,
        offset,
        where: whereClause,
        orderBy: (budget, { desc }) => desc(budget.startMonth),
      });

      return {
        data: budgets,
        meta: {
          limit,
          offset,
          totalItems: Number(total?.count ?? 0),
          isActiveFilterApplied: onlyActive,
        },
      };
    }),

  activeBudgets: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;
    const now = new Date();

    const budgets = await db.query.budget.findMany({
      where: and(
        eq(dbSchema.budget.userId, user.id),
        lte(dbSchema.budget.startMonth, now),
        gte(dbSchema.budget.endMonth, now),
      ),
      orderBy: (budget, { asc }) => asc(budget.endMonth),
    });

    return budgets;
  }),

  createBudget: protectedProcedure
    .input(createBudgetInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const [budgetRecord] = await db
        .insert(dbSchema.budget)
        .values({
          ...input,
          budgetAmount: input.budgetAmount,
          userId: user.id,
        })
        .returning();

      return budgetRecord;
    }),

  updateBudget: protectedProcedure
    .input(updateBudgetInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { budgetId, ...updates } = input;

      const existingBudget = await db.query.budget.findFirst({
        where: and(eq(dbSchema.budget.id, budgetId), eq(dbSchema.budget.userId, user.id)),
      });

      if (!existingBudget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.description !== undefined ? { description: updates.description } : {}),
        ...(updates.budgetAmount !== undefined ? { budgetAmount: updates.budgetAmount } : {}),
        ...(updates.startMonth !== undefined ? { startMonth: updates.startMonth } : {}),
        ...(updates.endMonth !== undefined ? { endMonth: updates.endMonth } : {}),
        updatedAt: new Date(),
      };

      const [updatedBudget] = await db
        .update(dbSchema.budget)
        .set(payload)
        .where(and(eq(dbSchema.budget.id, budgetId), eq(dbSchema.budget.userId, user.id)))
        .returning();

      return updatedBudget;
    }),

  deleteBudget: protectedProcedure
    .input(budgetIdInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { budgetId } = input;

      const budgetExists = await db.query.budget.findFirst({
        where: and(eq(dbSchema.budget.id, budgetId), eq(dbSchema.budget.userId, user.id)),
      });

      if (!budgetExists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      const [linkedExpenses] = await db
        .select({ count: count() })
        .from(dbSchema.expense)
        .where(
          and(
            eq(dbSchema.expense.budget, budgetId),
            eq(dbSchema.expense.userId, user.id),
          ),
        );

      if (Number(linkedExpenses?.count ?? 0) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a budget that has linked expenses",
        });
      }

      await db
        .delete(dbSchema.budget)
        .where(and(eq(dbSchema.budget.id, budgetId), eq(dbSchema.budget.userId, user.id)));

      return { success: true };
    }),

  budgetDetails: protectedProcedure
    .input(budgetIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { budgetId } = input;

      const budget = await db.query.budget.findFirst({
        where: and(eq(dbSchema.budget.id, budgetId), eq(dbSchema.budget.userId, user.id)),
      });

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      const expenses = await db.query.expense.findMany({
        where: and(
          eq(dbSchema.expense.userId, user.id),
          eq(dbSchema.expense.budget, budgetId),
        ),
        orderBy: (expense, { desc }) => desc(expense.createdAt),
      });

      const allocated = numericToNumber(budget.budgetAmount);
      const spent = expenses.reduce(
        (acc, expenseItem) => acc + numericToNumber(expenseItem.expenseAmount),
        0,
      );

      return {
        budget,
        expenses,
        totals: {
          allocated,
          spent,
          remaining: allocated - spent,
        },
      };
    }),
});
