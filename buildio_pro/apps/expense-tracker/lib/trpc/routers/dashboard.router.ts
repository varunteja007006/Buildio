import { and, count, eq, gte, lte } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";

function numericToNumber(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1); // exclusive
  return { start, end };
}

export const dashboardRouter = createTRPCRouter({
  overviewSummary: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { start, end } = monthBounds();

    const incomesThisMonth = await db
      .select({ amount: dbSchema.income.incomeAmount })
      .from(dbSchema.income)
      .where(
        and(
          eq(dbSchema.income.userId, user.id),
          gte(dbSchema.income.createdAt, start),
          lte(dbSchema.income.createdAt, end),
        ),
      );

    const expensesThisMonth = await db
      .select({ amount: dbSchema.expense.expenseAmount })
      .from(dbSchema.expense)
      .where(
        and(
          eq(dbSchema.expense.userId, user.id),
          gte(dbSchema.expense.createdAt, start),
          lte(dbSchema.expense.createdAt, end),
        ),
      );

    const allIncomes = await db
      .select({ amount: dbSchema.income.incomeAmount })
      .from(dbSchema.income)
      .where(eq(dbSchema.income.userId, user.id));

    const allExpenses = await db
      .select({ amount: dbSchema.expense.expenseAmount })
      .from(dbSchema.expense)
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
  }),

  activeBudgetsWithProgress: protectedProcedure.query(async ({ ctx }) => {
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

    // Fetch all expenses for these budgets in one query
    const budgetIds = budgets.map((b) => b.id);
    const expenses = await db.query.expense.findMany({
      where: and(
        eq(dbSchema.expense.userId, user.id),
        // expense.budget may be null; filter by ids
        // drizzle doesn't support IN via array eq; use a simple select-all then reduce
      ),
    });

    const spendByBudget = new Map<string, number>();
    for (const b of budgets) {
      spendByBudget.set(b.id, 0);
    }
    for (const e of expenses) {
      if (e.budget && spendByBudget.has(e.budget)) {
        spendByBudget.set(
          e.budget,
          (spendByBudget.get(e.budget) || 0) + numericToNumber(e.expenseAmount),
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
  }),

  recentTransactions: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const recentExpenses = await db.query.expense.findMany({
      where: eq(dbSchema.expense.userId, user.id),
      orderBy: (expense, { desc }) => desc(expense.createdAt),
      limit: 10,
      with: { category: true },
    });

    const recentIncomes = await db.query.income.findMany({
      where: eq(dbSchema.income.userId, user.id),
      orderBy: (income, { desc }) => desc(income.createdAt),
      limit: 10,
      with: { source: true },
    });

    const combined = [
      ...recentExpenses.map((e) => ({
        id: e.id,
        type: "expense" as const,
        name: e.name,
        amount: numericToNumber(e.expenseAmount),
        createdAt: e.createdAt,
        meta: { label: (e as any).category?.name ?? "Expense" },
      })),
      ...recentIncomes.map((i) => ({
        id: i.id,
        type: "income" as const,
        name: i.name,
        amount: numericToNumber(i.incomeAmount),
        createdAt: i.createdAt,
        meta: { label: (i as any).source?.name ?? "Income" },
      })),
    ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return combined.slice(0, 10);
  }),

  topCategoriesThisMonth: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { start, end } = monthBounds();

    const expenses = await db.query.expense.findMany({
      where: and(
        eq(dbSchema.expense.userId, user.id),
        gte(dbSchema.expense.createdAt, start),
        lte(dbSchema.expense.createdAt, end),
      ),
      with: { category: true },
    });

    const totals = new Map<
      string,
      { name: string; amount: number; count: number }
    >();

    for (const e of expenses) {
      const cat = (e as any).category;
      const key = cat?.id ?? "uncategorized";
      const name = cat?.name ?? "Uncategorized";
      const prev = totals.get(key) || { name, amount: 0, count: 0 };
      prev.amount += numericToNumber(e.expenseAmount);
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
  }),
});
