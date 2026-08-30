import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";
import {
  calculatePagination,
  createPaginationMeta,
  paginationInputSchema,
} from "../schemas/pagination.schema";

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((value) => Number(value) > 0, {
    message: "Amount must be greater than zero",
  });

const createExpenseInput = z.object({
  name: z.string().min(1, "Expense name required").max(255),
  amount: amountSchema,
  categoryId: z.uuid().optional(),
  budgetId: z.uuid().optional(),
  isRecurring: z.boolean().default(false),
});

const updateExpenseInput = z
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

const listExpensesInput = paginationInputSchema.extend({
  categoryId: z.uuid().optional(),
  budgetId: z.uuid().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const expenseIdInput = z.object({
  expenseId: z.uuid(),
});

const bulkDeleteInput = z.object({
  expenseIds: z.array(z.uuid()).min(1, "At least one expense ID is required"),
});

const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type ExpenseRow = {
  expense: typeof import("../../db/schema/expenses.schema").expense.$inferSelect;
  transaction: typeof import("../../db/schema/financial-transaction.schema").financialTransaction.$inferSelect;
  category: typeof import("../../db/schema/categories.schema").expenseCategory.$inferSelect | null;
  budget: typeof import("../../db/schema/budget.schema").budget.$inferSelect | null;
};

const toExpenseDto = (row: ExpenseRow) => ({
  ...row.expense,
  transaction: row.transaction,
  category: row.category,
  budget: row.budget,
  amount: numericToNumber(row.transaction.amount),
  transactionDate: row.transaction.transactionDate,
});

export const expenseRouter = createTRPCRouter({
  listExpenses: protectedProcedure
    .input(listExpensesInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { categoryId, budgetId, sortBy, sortOrder } = input;

      const filters = [eq(dbSchema.expense.userId, user.id)];

      if (categoryId) {
        filters.push(eq(dbSchema.expense.categoryId, categoryId));
      }

      if (budgetId) {
        filters.push(eq(dbSchema.expense.budgetId, budgetId));
      }

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.expense)
        .where(whereClause);

      const totalItems = Number(total?.count ?? 0);
      const { offset } = calculatePagination(input, totalItems);

      const orderBy =
        sortBy === "amount"
          ? sortOrder === "asc"
            ? dbSchema.financialTransaction.amount
            : desc(dbSchema.financialTransaction.amount)
          : sortOrder === "asc"
            ? dbSchema.expense.createdAt
            : desc(dbSchema.expense.createdAt);

      const rows = await db
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
        .where(whereClause)
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(offset);

      return {
        data: rows.map(toExpenseDto),
        meta: createPaginationMeta(input, totalItems),
      };
    }),

  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const rows = await db
      .select({
        expense: dbSchema.expense,
        transaction: dbSchema.financialTransaction,
        category: dbSchema.expenseCategory,
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
      .where(eq(dbSchema.expense.userId, user.id));

    const allExpenses = rows.map((row) => ({
      expense: row.expense,
      amount: numericToNumber(row.transaction.amount),
      transactionDate: row.transaction.transactionDate,
      category: row.category,
    }));

    const totalSpending = allExpenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const recurringExpenses = allExpenses.filter(
      (item) => item.expense.isRecurring,
    );
    const totalRecurring = recurringExpenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const monthlyData: Record<string, number> = {};
    allExpenses.forEach((item) => {
      const d = new Date(item.transactionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = (monthlyData[key] || 0) + item.amount;
    });

    const monthlyBreakdown = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, amount]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year!), parseInt(month!) - 1);
        return {
          month: date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          amount,
          rawDate: key,
        };
      });

    const categoryMap = new Map<
      string,
      { amount: number; count: number; name: string }
    >();
    allExpenses.forEach((item) => {
      const categoryName = item.category?.name || "Uncategorized";
      const current = categoryMap.get(categoryName) || {
        amount: 0,
        count: 0,
        name: categoryName,
      };
      categoryMap.set(categoryName, {
        amount: current.amount + item.amount,
        count: current.count + 1,
        name: categoryName,
      });
    });

    const categoryBreakdown = Array.from(categoryMap.values()).sort(
      (a, b) => b.amount - a.amount,
    );

    return {
      totalSpending,
      totalRecurring,
      monthlyBreakdown,
      categoryBreakdown,
    };
  }),

  getExpenseById: protectedProcedure
    .input(expenseIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { expenseId } = input;

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
        .where(
          and(
            eq(dbSchema.expense.id, expenseId),
            eq(dbSchema.expense.userId, user.id),
          ),
        )
        .limit(1);

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      return toExpenseDto(row);
    }),

  createExpense: protectedProcedure
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
    }),

  updateExpense: protectedProcedure
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
            .where(eq(dbSchema.financialTransaction.id, existingExpense.transactionId));
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
    }),

  deleteExpense: protectedProcedure
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
    }),

  deleteExpenses: protectedProcedure
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
    }),
});
