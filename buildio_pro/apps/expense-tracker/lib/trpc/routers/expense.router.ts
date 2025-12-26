import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";

import { zodSchema } from "@/lib/db/zod-schema";

const expenseAmountSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((value) => Number(value) > 0, {
    message: "Expense amount must be greater than zero",
  });

const createExpenseInput = z.object({
  name: z.string().min(1, "Expense name required").max(255),
  expenseAmount: expenseAmountSchema,
  categoryId: z.string().uuid().optional(),
  budgetId: z.string().uuid().optional(),
  isRecurring: z.boolean().default(false),
  account: z.string().max(255).optional(),
});

const updateExpenseInput = z
  .object({
    expenseId: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
    expenseAmount: expenseAmountSchema.optional(),
    categoryId: z.string().uuid().nullable().optional(),
    budgetId: z.string().uuid().nullable().optional(),
    isRecurring: z.boolean().optional(),
    account: z.string().max(255).optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdatableField =
      data.name !== undefined ||
      data.expenseAmount !== undefined ||
      data.categoryId !== undefined ||
      data.budgetId !== undefined ||
      data.isRecurring !== undefined ||
      data.account !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["expenseId"],
        message: "Provide at least one field to update",
      });
    }
  });

const listExpensesInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  categoryId: z.string().uuid().optional(),
  budgetId: z.string().uuid().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const expenseIdInput = z.object({
  expenseId: z.string().uuid(),
});

const numericToNumber = (value: string | number | null) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const expenseRouter = createTRPCRouter({
  listExpenses: protectedProcedure
    .input(listExpensesInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { limit, offset, categoryId, budgetId, sortBy, sortOrder } = input;

      const filters = [eq(dbSchema.expense.userId, user.id)];

      if (categoryId) {
        filters.push(eq(dbSchema.expense.categoryId, categoryId));
      }

      if (budgetId) {
        filters.push(eq(dbSchema.expense.budget, budgetId));
      }

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.expense)
        .where(whereClause);

      const expenses = await db.query.expense.findMany({
        limit,
        offset,
        where: whereClause,
        with: {
          category: true,
        },
        orderBy: (expense, { asc, desc }) => {
          const order = sortOrder === "asc" ? asc : desc;
          return sortBy === "amount"
            ? order(expense.expenseAmount)
            : order(expense.createdAt);
        },
      });

      return {
        data: expenses,
        meta: {
          limit,
          offset,
          totalItems: Number(total?.count ?? 0),
          hasMore: offset + limit < Number(total?.count ?? 0),
        },
      };
    }),

  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    // Fetch all expenses
    const allExpenses = await db.query.expense.findMany({
      where: eq(dbSchema.expense.userId, user.id),
      with: {
        category: true,
      },
      orderBy: (expense, { asc }) => asc(expense.createdAt),
    });

    const totalSpending = allExpenses.reduce(
      (sum, item) => sum + numericToNumber(item.expenseAmount),
      0,
    );

    const recurringExpenses = allExpenses.filter((item) => item.isRecurring);
    const totalRecurring = recurringExpenses.reduce(
      (sum, item) => sum + numericToNumber(item.expenseAmount),
      0,
    );

    // Monthly Breakdown
    const monthlyData: Record<string, number> = {};
    allExpenses.forEach((item) => {
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] =
        (monthlyData[key] || 0) + numericToNumber(item.expenseAmount);
    });

    const monthlyBreakdown = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, amount]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          amount,
          rawDate: key,
        };
      });

    // Category Breakdown
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
        amount: current.amount + numericToNumber(item.expenseAmount),
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

      const expense = await db.query.expense.findFirst({
        where: and(
          eq(dbSchema.expense.id, expenseId),
          eq(dbSchema.expense.userId, user.id),
        ),
        with: {
          category: true,
          budget: true,
        },
      });

      if (!expense) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      return expense;
    }),

  createExpense: protectedProcedure
    .input(createExpenseInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      // Validate budget exists if provided
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

      // Validate category exists if provided
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

      const [expenseRecord] = await db
        .insert(dbSchema.expense)
        .values({
          ...input,
          expenseAmount: input.expenseAmount,
          userId: user.id,
          budget: input.budgetId || null,
        })
        .returning();

      return expenseRecord;
    }),

  updateExpense: protectedProcedure
    .input(updateExpenseInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { expenseId, ...updates } = input;

      // Verify expense exists and belongs to user
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

      // Validate budget exists if updating
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

      // Validate category exists if updating
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

      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.expenseAmount !== undefined
          ? { expenseAmount: updates.expenseAmount }
          : {}),
        ...(updates.categoryId !== undefined
          ? { categoryId: updates.categoryId }
          : {}),
        ...(updates.budgetId !== undefined ? { budget: updates.budgetId } : {}),
        ...(updates.isRecurring !== undefined
          ? { isRecurring: updates.isRecurring }
          : {}),
        ...(updates.account !== undefined ? { account: updates.account } : {}),
        updatedAt: new Date(),
      };

      const [updatedExpense] = await db
        .update(dbSchema.expense)
        .set(payload)
        .where(
          and(
            eq(dbSchema.expense.id, expenseId),
            eq(dbSchema.expense.userId, user.id),
          ),
        )
        .returning();

      return updatedExpense;
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

      await db
        .delete(dbSchema.expense)
        .where(
          and(
            eq(dbSchema.expense.id, expenseId),
            eq(dbSchema.expense.userId, user.id),
          ),
        );

      return { success: true };
    }),
});
