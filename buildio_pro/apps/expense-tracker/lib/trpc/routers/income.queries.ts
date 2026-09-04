import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  incomeIdInput,
  listIncomesInput,
  numericToNumber,
  toIncomeDto,
} from "./income.schemas";
import {
  calculatePagination,
  createPaginationMeta,
} from "../schemas/pagination.schema";

export const listIncomes = protectedProcedure
  .input(listIncomesInput)
  .query(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;

    const filters = [eq(dbSchema.income.userId, user.id)];

    const whereClause = filters.length === 1 ? filters[0] : and(...filters);

    const [total] = await db
      .select({ count: count() })
      .from(dbSchema.income)
      .where(whereClause);

    const totalItems = Number(total?.count ?? 0);
    const { offset } = calculatePagination(input, totalItems);

    const rows = await db
      .select({
        income: dbSchema.income,
        transaction: dbSchema.financialTransaction,
        source: dbSchema.incomeSource,
      })
      .from(dbSchema.income)
      .innerJoin(
        dbSchema.financialTransaction,
        eq(dbSchema.income.transactionId, dbSchema.financialTransaction.id),
      )
      .leftJoin(
        dbSchema.incomeSource,
        eq(dbSchema.income.sourceId, dbSchema.incomeSource.id),
      )
      .where(whereClause)
      .orderBy(desc(dbSchema.financialTransaction.transactionDate))
      .limit(input.limit)
      .offset(offset);

    return {
      data: rows.map(toIncomeDto),
      meta: createPaginationMeta(input, totalItems),
    };
  });

export const getAnalytics = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const rows = await db
    .select({
      income: dbSchema.income,
      transaction: dbSchema.financialTransaction,
      source: dbSchema.incomeSource,
    })
    .from(dbSchema.income)
    .innerJoin(
      dbSchema.financialTransaction,
      eq(dbSchema.income.transactionId, dbSchema.financialTransaction.id),
    )
    .leftJoin(
      dbSchema.incomeSource,
      eq(dbSchema.income.sourceId, dbSchema.incomeSource.id),
    )
    .where(eq(dbSchema.income.userId, user.id));

  const allIncomes = rows.map((row) => ({
    income: row.income,
    amount: numericToNumber(row.transaction.amount),
    transactionDate: row.transaction.transactionDate,
    source: row.source,
  }));

  const expenseRows = await db
    .select({ transaction: dbSchema.financialTransaction })
    .from(dbSchema.expense)
    .innerJoin(
      dbSchema.financialTransaction,
      eq(dbSchema.expense.transactionId, dbSchema.financialTransaction.id),
    )
    .where(eq(dbSchema.expense.userId, user.id));

  const totalIncome = allIncomes.reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = expenseRows.reduce(
    (sum, item) => sum + numericToNumber(item.transaction.amount),
    0,
  );

  const netIncome = totalIncome - totalExpenses;

  const monthlyData: Record<string, number> = {};
  allIncomes.forEach((item) => {
    const d = new Date(item.transactionDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = (monthlyData[key] || 0) + item.amount;
  });

  const monthlyBreakdown = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, amount]) => {
      const [year, month] = key.split("-");
      const date = new Date(
        parseInt(year || "0"),
        parseInt(month || "0") - 1,
      );
      return {
        month: date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        amount,
        rawDate: key,
      };
    });

  const sourceMap = new Map<string, number>();
  allIncomes.forEach((item) => {
    const sourceName = item.source?.name || "Unspecified";
    const current = sourceMap.get(sourceName) || 0;
    sourceMap.set(sourceName, current + item.amount);
  });

  const sourceBreakdown = Array.from(sourceMap.entries())
    .map(([source, amount]) => ({
      source,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    netIncome,
    monthlyBreakdown,
    sourceBreakdown,
  };
});

export const getIncomeById = protectedProcedure
  .input(incomeIdInput)
  .query(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { incomeId } = input;

    const [row] = await db
      .select({
        income: dbSchema.income,
        transaction: dbSchema.financialTransaction,
        source: dbSchema.incomeSource,
      })
      .from(dbSchema.income)
      .innerJoin(
        dbSchema.financialTransaction,
        eq(dbSchema.income.transactionId, dbSchema.financialTransaction.id),
      )
      .leftJoin(
        dbSchema.incomeSource,
        eq(dbSchema.income.sourceId, dbSchema.incomeSource.id),
      )
      .where(
        and(
          eq(dbSchema.income.id, incomeId),
          eq(dbSchema.income.userId, user.id),
        ),
      )
      .limit(1);

    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Income not found" });
    }

    return toIncomeDto(row);
  });
