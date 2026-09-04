import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  bulkDeleteInput,
  expenseIdInput,
  toExpenseDto,
  updateExpenseInput,
} from "./expense.schemas";

export const updateExpense = protectedProcedure
  .input(updateExpenseInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { expenseId, ...updates } = input;

    const existingExpense = await db.query.expense.findFirst({
      where: and(
        eq(dbSchema.expense.id, expenseId),
        eq(dbSchema.expense.userId, user.id),
      ),
    });

    if (!existingExpense) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expense not found",
      });
    }

    if (updates.budgetId !== undefined && updates.budgetId !== null) {
      const budgetExists = await db.query.budget.findFirst({
        where: and(
          eq(dbSchema.budget.id, updates.budgetId),
          eq(dbSchema.budget.userId, user.id),
        ),
      });

      if (!budgetExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Budget not found",
        });
      }
    }

    if (updates.categoryId !== undefined && updates.categoryId !== null) {
      const categoryExists = await db.query.expenseCategory.findFirst({
        where: eq(dbSchema.expenseCategory.id, updates.categoryId),
      });

      if (!categoryExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
    }

    await db.transaction(async (tx) => {
      const expensePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (updates.name !== undefined) {
        expensePayload.name = updates.name;
      }
      if (updates.categoryId !== undefined) {
        expensePayload.categoryId = updates.categoryId;
      }
      if (updates.budgetId !== undefined) {
        expensePayload.budgetId = updates.budgetId;
      }
      if (updates.isRecurring !== undefined) {
        expensePayload.isRecurring = updates.isRecurring;
      }

      await tx
        .update(dbSchema.expense)
        .set(expensePayload)
        .where(
          and(
            eq(dbSchema.expense.id, expenseId),
            eq(dbSchema.expense.userId, user.id),
          ),
        );

      if (updates.amount !== undefined || updates.name !== undefined) {
        const transactionPayload: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        if (updates.amount !== undefined) {
          transactionPayload.amount = updates.amount;
        }
        if (updates.name !== undefined) {
          transactionPayload.merchantName = updates.name;
          transactionPayload.description = updates.name;
        }
        await tx
          .update(dbSchema.financialTransaction)
          .set(transactionPayload)
          .where(
            eq(
              dbSchema.financialTransaction.id,
              existingExpense.transactionId,
            ),
          );
      }
    });

    const [row] = await db
      .select({
        expense: dbSchema.expense,
        transaction: dbSchema.financialTransaction,
        category: dbSchema.expenseCategory,
        budget: dbSchema.budget,
      })
      .from(dbSchema.expense)
      .innerJoin(
        dbSchema.financialTransaction,
        eq(dbSchema.expense.transactionId, dbSchema.financialTransaction.id),
      )
      .leftJoin(
        dbSchema.expenseCategory,
        eq(dbSchema.expense.categoryId, dbSchema.expenseCategory.id),
      )
      .leftJoin(
        dbSchema.budget,
        eq(dbSchema.expense.budgetId, dbSchema.budget.id),
      )
      .where(eq(dbSchema.expense.id, expenseId))
      .limit(1);

    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expense not found",
      });
    }

    return toExpenseDto(row);
  });

export const deleteExpense = protectedProcedure
  .input(expenseIdInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { expenseId } = input;

    const expenseExists = await db.query.expense.findFirst({
      where: and(
        eq(dbSchema.expense.id, expenseId),
        eq(dbSchema.expense.userId, user.id),
      ),
    });

    if (!expenseExists) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expense not found",
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(dbSchema.expense)
        .where(
          and(
            eq(dbSchema.expense.id, expenseId),
            eq(dbSchema.expense.userId, user.id),
          ),
        );
      await tx
        .delete(dbSchema.financialTransaction)
        .where(
          eq(dbSchema.financialTransaction.id, expenseExists.transactionId),
        );
    });

    return { success: true };
  });

export const deleteExpenses = protectedProcedure
  .input(bulkDeleteInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { expenseIds } = input;

    const expenseExists = await db.query.expense.findMany({
      where: and(
        inArray(dbSchema.expense.id, expenseIds),
        eq(dbSchema.expense.userId, user.id),
      ),
    });

    const existingExpensesIds = new Set(expenseExists.map((item) => item.id));
    const transactionIds = expenseExists.map((item) => item.transactionId);

    const missingIds = expenseIds.filter(
      (id) => !existingExpensesIds.has(id),
    );

    if (existingExpensesIds.size === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expenses not found",
      });
    }

    if (existingExpensesIds.size > 0) {
      await db.transaction(async (tx) => {
        await tx
          .delete(dbSchema.expense)
          .where(
            and(
              inArray(dbSchema.expense.id, expenseIds),
              eq(dbSchema.expense.userId, user.id),
            ),
          );
        await tx
          .delete(dbSchema.financialTransaction)
          .where(inArray(dbSchema.financialTransaction.id, transactionIds));
      });
    }

    return {
      success: true,
      deletedIds: Array.from(existingExpensesIds),
      notFoundIds: missingIds,
      skipped: [],
      message: `${existingExpensesIds.size} expenses deleted successfully`,
    };
  });
