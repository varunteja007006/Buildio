import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  expenseIdInput,
  listExpensesInput,
  numericToNumber,
  toExpenseDto,
} from "./expense.schemas";
import {
  calculatePagination,
  createPaginationMeta,
} from "../schemas/pagination.schema";

export const listExpenses = protectedProcedure
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
      .where(whereClause)
      .orderBy(orderBy)
      .limit(input.limit)
      .offset(offset);

    return {
      data: rows.map(toExpenseDto),
      meta: createPaginationMeta(input, totalItems),
    };
  });

export const getAnalytics = protectedProcedure.query(async ({ ctx }) => {
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
});

export const getExpenseById = protectedProcedure
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
  });
