import { TRPCError } from "@trpc/server";
import { and, count, eq, gte, lte } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "../init";
import {
  budgetIdInput,
  createBudgetInput,
  listBudgetInput,
  updateBudgetInput,
} from "./budget.schemas";
import {
  calculatePagination,
  createPaginationMeta,
} from "../schemas/pagination.schema";

const numericToNumber = (value: string | number | null) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const budgetRouter = createTRPCRouter({
  budgetList: protectedProcedure
    .input(listBudgetInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { onlyActive } = input;

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

      const totalItems = Number(total?.count ?? 0);
      const { offset } = calculatePagination(input, totalItems);

      const budgets = await db.query.budget.findMany({
        limit: input.limit,
        offset,
        where: whereClause,
        orderBy: (budget, { desc }) => desc(budget.startMonth),
      });

      return {
        data: budgets,
        meta: {
          ...createPaginationMeta(input, totalItems),
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
        where: and(
          eq(dbSchema.budget.id, budgetId),
          eq(dbSchema.budget.userId, user.id),
        ),
      });

      if (!existingBudget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.description !== undefined
          ? { description: updates.description }
          : {}),
        ...(updates.budgetAmount !== undefined
          ? { budgetAmount: updates.budgetAmount }
          : {}),
        ...(updates.startMonth !== undefined
          ? { startMonth: updates.startMonth }
          : {}),
        ...(updates.endMonth !== undefined
          ? { endMonth: updates.endMonth }
          : {}),
        updatedAt: new Date(),
      };

      const [updatedBudget] = await db
        .update(dbSchema.budget)
        .set(payload)
        .where(
          and(
            eq(dbSchema.budget.id, budgetId),
            eq(dbSchema.budget.userId, user.id),
          ),
        )
        .returning();

      return updatedBudget;
    }),

  deleteBudget: protectedProcedure
    .input(budgetIdInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { budgetId } = input;

      const budgetExists = await db.query.budget.findFirst({
        where: and(
          eq(dbSchema.budget.id, budgetId),
          eq(dbSchema.budget.userId, user.id),
        ),
      });

      if (!budgetExists) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      const [linkedExpenses] = await db
        .select({ count: count() })
        .from(dbSchema.expense)
        .where(
          and(
            eq(dbSchema.expense.budgetId, budgetId),
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
        .where(
          and(
            eq(dbSchema.budget.id, budgetId),
            eq(dbSchema.budget.userId, user.id),
          ),
        );

      return { success: true };
    }),

  budgetDetails: protectedProcedure
    .input(budgetIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { budgetId } = input;

      const budget = await db.query.budget.findFirst({
        where: and(
          eq(dbSchema.budget.id, budgetId),
          eq(dbSchema.budget.userId, user.id),
        ),
      });

      if (!budget) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
      }

      const expenses = await db.query.expense.findMany({
        where: and(
          eq(dbSchema.expense.userId, user.id),
          eq(dbSchema.expense.budgetId, budgetId),
        ),
        with: {
          transaction: true,
        },
        orderBy: (expense, { desc }) => desc(expense.createdAt),
      });

      const allocated = numericToNumber(budget.budgetAmount);
      const spent = expenses.reduce(
        (acc, expenseItem) =>
          acc + numericToNumber(expenseItem.transaction?.amount),
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
