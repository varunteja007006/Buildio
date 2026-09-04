import { and, eq, isNull } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  monthKey,
  monthLabel,
  numericToNumber,
} from "./analytics.helpers";

export const getInvestments = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const investments = await db.query.investmentTransaction.findMany({
    where: eq(dbSchema.investmentTransaction.userId, user.id),
    with: { transaction: true, platform: true, investmentType: true },
  });

  const byMonth = new Map<string, { invested: number; value: number }>();

  for (const investment of investments) {
    const transaction = investment.transaction;
    const amount = numericToNumber(transaction.amount);
    const value =
      numericToNumber(investment.units) *
      numericToNumber(investment.unitPrice);
    const key = monthKey(new Date(transaction.transactionDate));
    const month = byMonth.get(key) ?? { invested: 0, value: 0 };
    month.invested += amount;
    month.value += value;
    byMonth.set(key, month);
  }

  return {
    monthly: Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rawDate, m]) => ({
        month: monthLabel(rawDate),
        rawDate,
        invested: m.invested,
        value: m.value,
      })),
    totalInvested: Array.from(byMonth.values()).reduce(
      (a, m) => a + m.invested,
      0,
    ),
    totalValue: Array.from(byMonth.values()).reduce((a, m) => a + m.value, 0),
  };
});

export const getCrossCutting = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const budgets = await db.query.budget.findMany({
    where: eq(dbSchema.budget.userId, user.id),
  });

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
  });
  const statements = await db.query.statementUpload.findMany({
    where: eq(dbSchema.statementUpload.userId, user.id),
  });

  const monthlySpend = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  for (const transaction of transactions) {
    const key = monthKey(new Date(transaction.transactionDate));
    if (
      transaction.direction === "debit" &&
      transaction.transactionType !== "transfer"
    ) {
      monthlySpend.set(
        key,
        (monthlySpend.get(key) || 0) + numericToNumber(transaction.amount),
      );
    }
    typeCounts.set(
      transaction.transactionType,
      (typeCounts.get(transaction.transactionType) || 0) + 1,
    );
  }

  const duplicatesByHash = new Map<string, number>();
  for (const transaction of transactions) {
    if (!transaction.transactionHash) continue;
    duplicatesByHash.set(
      transaction.transactionHash,
      (duplicatesByHash.get(transaction.transactionHash) || 0) + 1,
    );
  }

  const reviewCount = transactions.filter(
    (t) => numericToNumber(t.extractionConfidence) < 0.8 && !t.reviewedAt,
  ).length;

  return {
    budgets: budgets.map((budget) => ({
      ...budget,
      budgetAmount: numericToNumber(budget.budgetAmount),
      actualSpend:
        monthlySpend.get(monthKey(new Date(budget.startMonth))) ?? 0,
    })),
    monthlySpend: Array.from(monthlySpend.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rawDate, amount]) => ({
        month: monthLabel(rawDate),
        rawDate,
        amount,
      })),
    dataQuality: {
      statements: statements.length,
      byModel: Array.from(
        new Map(
          statements.map((s) => [
            s.extractionModel ?? "unknown",
            s.extractionModel ?? "unknown",
          ]),
        ).keys(),
      ).map((model) => ({
        model,
        count: statements.filter((s) => s.extractionModel === model).length,
      })),
      reviewCount,
      reviewRate: transactions.length ? reviewCount / transactions.length : 0,
    },
    duplicateCount: Array.from(duplicatesByHash.values()).filter((n) => n > 1)
      .length,
    typeCounts: Array.from(typeCounts.entries()).map(([type, count]) => ({
      type,
      count,
    })),
  };
});
