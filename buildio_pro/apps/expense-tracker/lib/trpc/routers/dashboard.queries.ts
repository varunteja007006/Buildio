import { and, eq, gte, lte } from "drizzle-orm";

import { protectedProcedure } from "../init";
import { monthBounds, numericToNumber } from "./dashboard.helpers";

export const overviewSummary = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;
  const { start, end } = monthBounds();

  const incomeTx = dbSchema.financialTransaction;
  const expenseTx = dbSchema.financialTransaction;

  const incomesThisMonth = await db
    .select({ amount: incomeTx.amount })
    .from(dbSchema.income)
    .innerJoin(incomeTx, eq(dbSchema.income.transactionId, incomeTx.id))
    .where(
      and(
        eq(dbSchema.income.userId, user.id),
        gte(incomeTx.transactionDate, start),
        lte(incomeTx.transactionDate, end),
      ),
    );

  const expensesThisMonth = await db
    .select({ amount: expenseTx.amount })
    .from(dbSchema.expense)
    .innerJoin(expenseTx, eq(dbSchema.expense.transactionId, expenseTx.id))
    .where(
      and(
        eq(dbSchema.expense.userId, user.id),
        gte(expenseTx.transactionDate, start),
        lte(expenseTx.transactionDate, end),
      ),
    );

  const allIncomes = await db
    .select({ amount: incomeTx.amount })
    .from(dbSchema.income)
    .innerJoin(incomeTx, eq(dbSchema.income.transactionId, incomeTx.id))
    .where(eq(dbSchema.income.userId, user.id));

  const allExpenses = await db
    .select({ amount: expenseTx.amount })
    .from(dbSchema.expense)
    .innerJoin(expenseTx, eq(dbSchema.expense.transactionId, expenseTx.id))
    .where(eq(dbSchema.expense.userId, user.id));

  const incomeMonth = incomesThisMonth.reduce(
    (acc, r) => acc + numericToNumber(r.amount),
    0,
  );
  const expenseMonth = expensesThisMonth.reduce(
    (acc, r) => acc + numericToNumber(r.amount),
    0,
  );

  const incomeAll = allIncomes.reduce(
    (acc, r) => acc + numericToNumber(r.amount),
    0,
  );
  const expenseAll = allExpenses.reduce(
    (acc, r) => acc + numericToNumber(r.amount),
    0,
  );

  return {
    month: {
      start,
      end,
      income: incomeMonth,
      expenses: expenseMonth,
      net: incomeMonth - expenseMonth,
    },
    allTime: {
      income: incomeAll,
      expenses: expenseAll,
      balance: incomeAll - expenseAll,
    },
  };
});

export const activeBudgetsWithProgress = protectedProcedure.query(
  async ({ ctx }) => {
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

    if (budgets.length === 0) return [];

    const expenses = await db.query.expense.findMany({
      where: eq(dbSchema.expense.userId, user.id),
      with: { transaction: true },
    });

    const spendByBudget = new Map<string, number>();
    for (const b of budgets) {
      spendByBudget.set(b.id, 0);
    }
    for (const e of expenses) {
      if (e.budgetId && spendByBudget.has(e.budgetId)) {
        spendByBudget.set(
          e.budgetId,
          (spendByBudget.get(e.budgetId) || 0) +
            numericToNumber(e.transaction?.amount),
        );
      }
    }

    return budgets.map((b) => {
      const allocated = numericToNumber(b.budgetAmount);
      const spent = spendByBudget.get(b.id) || 0;
      const remaining = allocated - spent;
      const percentSpent =
        allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
      return {
        id: b.id,
        name: b.name,
        description: b.description,
        startMonth: b.startMonth,
        endMonth: b.endMonth,
        allocated,
        spent,
        remaining,
        percentSpent,
        overBudget: spent > allocated,
      };
    });
  },
);

export const recentTransactions = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const recentExpenses = await db.query.expense.findMany({
    where: eq(dbSchema.expense.userId, user.id),
    orderBy: (expense, { desc }) => desc(expense.createdAt),
    limit: 10,
    with: { category: true, transaction: true },
  });

  const recentIncomes = await db.query.income.findMany({
    where: eq(dbSchema.income.userId, user.id),
    orderBy: (income, { desc }) => desc(income.createdAt),
    limit: 10,
    with: { source: true, transaction: true },
  });

  const combined = [
    ...recentExpenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      name: e.name,
      amount: numericToNumber(e.transaction?.amount),
      createdAt: e.transaction?.transactionDate ?? e.createdAt,
      meta: { label: e.category?.name ?? "Expense" },
    })),
    ...recentIncomes.map((i) => ({
      id: i.id,
      type: "income" as const,
      name: i.name,
      amount: numericToNumber(i.transaction?.amount),
      createdAt: i.transaction?.transactionDate ?? i.createdAt,
      meta: { label: i.source?.name ?? "Income" },
    })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return combined.slice(0, 10);
});

export const topCategoriesThisMonth = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;
  const { start, end } = monthBounds();

  const expenses = await db.query.expense.findMany({
    where: and(
      eq(dbSchema.expense.userId, user.id),
      gte(dbSchema.expense.createdAt, start),
      lte(dbSchema.expense.createdAt, end),
    ),
    with: { category: true, transaction: true },
  });

  const totals = new Map<
    string,
    { name: string; amount: number; count: number }
  >();

  for (const e of expenses) {
    const cat = e.category;
    const key = cat?.id ?? "uncategorized";
    const name = cat?.name ?? "Uncategorized";
    const prev = totals.get(key) || { name, amount: 0, count: 0 };
    prev.amount += numericToNumber(e.transaction?.amount);
    prev.count += 1;
    totals.set(key, prev);
  }

  const result = Array.from(totals.entries())
    .map(([id, v]) => ({
      id,
      name: v.name,
      totalSpent: v.amount,
      count: v.count,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return result;
});
