import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { protectedProcedure } from "../init";
import { createExpenseInput, toExpenseDto } from "./expense.schemas";

export const createExpense = protectedProcedure
  .input(createExpenseInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;

    if (input.budgetId) {
      const budgetExists = await db.query.budget.findFirst({
        where: and(
          eq(dbSchema.budget.id, input.budgetId),
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

    if (input.categoryId) {
      const categoryExists = await db.query.expenseCategory.findFirst({
        where: eq(dbSchema.expenseCategory.id, input.categoryId),
      });

      if (!categoryExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
    }

    const result = await db.transaction(async (tx) => {
      const [transaction] = await tx
        .insert(dbSchema.financialTransaction)
        .values({
          userId: user.id,
          amount: input.amount,
          direction: "debit",
          transactionType: "expense",
          merchantName: input.name,
          description: input.name,
          isRecurring: input.isRecurring,
        })
        .returning();

      const [expenseRecord] = await tx
        .insert(dbSchema.expense)
        .values({
          userId: user.id,
          transactionId: transaction!.id,
          name: input.name,
          categoryId: input.categoryId || null,
          budgetId: input.budgetId || null,
          isRecurring: input.isRecurring,
        })
        .returning();

      const [row] = await tx
        .select({
          expense: dbSchema.expense,
          transaction: dbSchema.financialTransaction,
          category: dbSchema.expenseCategory,
          budget: dbSchema.budget,
        })
        .from(dbSchema.expense)
        .innerJoin(
          dbSchema.financialTransaction,
          eq(
            dbSchema.expense.transactionId,
            dbSchema.financialTransaction.id,
          ),
        )
        .leftJoin(
          dbSchema.expenseCategory,
          eq(dbSchema.expense.categoryId, dbSchema.expenseCategory.id),
        )
        .leftJoin(
          dbSchema.budget,
          eq(dbSchema.expense.budgetId, dbSchema.budget.id),
        )
        .where(eq(dbSchema.expense.id, expenseRecord!.id))
        .limit(1);

      return row;
    });

    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create expense",
      });
    }

    return toExpenseDto(result);
  });
