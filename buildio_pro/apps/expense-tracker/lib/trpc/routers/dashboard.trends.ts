import { and, eq, gte, lte } from "drizzle-orm";

import { protectedProcedure } from "../init";
import { numericToNumber } from "./dashboard.helpers";

export const overBudgetAnalysis = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;
  const now = new Date();

  const budgets = await db.query.budget.findMany({
    where: and(
      eq(dbSchema.budget.userId, user.id),
      lte(dbSchema.budget.startMonth, now),
      gte(dbSchema.budget.endMonth, now),
    ),
  });

  if (budgets.length === 0) return [];

  const expenses = await db.query.expense.findMany({
    where: eq(dbSchema.expense.userId, user.id),
    with: { category: true, transaction: true },
  });

  const result = [];

  for (const b of budgets) {
    const budgetExpenses = expenses.filter((e) => e.budgetId === b.id);
    const spent = budgetExpenses.reduce(
      (acc, e) => acc + numericToNumber(e.transaction?.amount),
      0,
    );
    const allocated = numericToNumber(b.budgetAmount);

    if (spent > allocated) {
      const catTotals = new Map<string, number>();
      for (const e of budgetExpenses) {
        const catName = e.category?.name ?? "Uncategorized";
        catTotals.set(
          catName,
          (catTotals.get(catName) || 0) +
            numericToNumber(e.transaction?.amount),
        );
      }

      const topCategories = Array.from(catTotals.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      result.push({
        budgetId: b.id,
        budgetName: b.name,
        allocated,
        spent,
        topCategories,
      });
    }
  }

  return result;
});

export const budgetVsActualHistory = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const budgets = await db.query.budget.findMany({
    where: and(
      eq(dbSchema.budget.userId, user.id),
      gte(dbSchema.budget.endMonth, sixMonthsAgo),
      lte(dbSchema.budget.endMonth, now),
    ),
    orderBy: (budget, { asc }) => asc(budget.endMonth),
  });

  const expenses = await db.query.expense.findMany({
    where: eq(dbSchema.expense.userId, user.id),
    with: { transaction: true },
  });

  return budgets.map((b) => {
    const budgetExpenses = expenses.filter((e) => e.budgetId === b.id);
    const spent = budgetExpenses.reduce(
      (acc, e) => acc + numericToNumber(e.transaction?.amount),
      0,
    );
    return {
      month: b.endMonth.toLocaleString("default", { month: "short" }),
      budget: numericToNumber(b.budgetAmount),
      actual: spent,
    };
  });
});

export const monthlyTrends = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const expenses = await db.query.expense.findMany({
    where: and(
      eq(dbSchema.expense.userId, user.id),
      gte(dbSchema.expense.createdAt, sixMonthsAgo),
    ),
    with: { transaction: true },
  });

  const incomes = await db.query.income.findMany({
    where: and(
      eq(dbSchema.income.userId, user.id),
      gte(dbSchema.income.createdAt, sixMonthsAgo),
    ),
    with: { transaction: true },
  });

  const data = new Map<string, { income: number; expense: number }>();

  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = d.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    data.set(key, { income: 0, expense: 0 });
  }

  expenses.forEach((e) => {
    const key = (
      e.transaction?.transactionDate ?? e.createdAt
    ).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (data.has(key)) {
      const curr = data.get(key)!;
      curr.expense += numericToNumber(e.transaction?.amount);
    }
  });

  incomes.forEach((i) => {
    const key = (
      i.transaction?.transactionDate ?? i.createdAt
    ).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (data.has(key)) {
      const curr = data.get(key)!;
      curr.income += numericToNumber(i.transaction?.amount);
    }
  });

  return Array.from(data.entries()).map(([month, values]) => ({
    month,
    ...values,
  }));
});

export const recurringExpenses = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;
  return await db.query.expense.findMany({
    where: and(
      eq(dbSchema.expense.userId, user.id),
      eq(dbSchema.expense.isRecurring, true),
    ),
    with: { category: true, transaction: true },
    orderBy: (expense, { desc }) => desc(expense.createdAt),
  });
});
