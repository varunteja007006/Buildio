import { and, eq, isNotNull, isNull } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  monthKey,
  monthLabel,
  numericToNumber,
} from "./analytics.helpers";

export const getCashFlow = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
    with: { bankAccount: true },
    orderBy: (t, { asc }) => asc(t.transactionDate),
  });

  const byAccount = new Map<
    string,
    {
      accountName: string | null;
      byMonth: Map<
        string,
        { debit: number; credit: number; lastBalance: number | null }
      >;
    }
  >();

  for (const transaction of transactions) {
    if (transaction.transactionType === "transfer") continue;
    const accountId = transaction.bankAccountId ?? "unknown";
    let account = byAccount.get(accountId);
    if (!account) {
      account = {
        accountName: transaction.bankAccount?.name ?? null,
        byMonth: new Map(),
      };
      byAccount.set(accountId, account);
    }
    const key = monthKey(new Date(transaction.transactionDate));
    const month = account.byMonth.get(key) ?? {
      debit: 0,
      credit: 0,
      lastBalance: null,
    };
    const amount = numericToNumber(transaction.amount);
    if (transaction.direction === "debit") {
      month.debit += amount;
    } else {
      month.credit += amount;
    }
    if (transaction.balanceAfter) {
      month.lastBalance = numericToNumber(transaction.balanceAfter);
    }
    account.byMonth.set(key, month);
  }

  return Array.from(byAccount.entries()).map(([bankAccountId, account]) => {
    const months = Array.from(account.byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rawDate, m]) => ({
        month: monthLabel(rawDate),
        rawDate,
        debit: m.debit,
        credit: m.credit,
        net: m.credit - m.debit,
        closingBalance: m.lastBalance,
      }));

    const debitMonths = months.map((m) => m.debit);
    const avgMonthlyBurn =
      debitMonths.length > 0
        ? debitMonths.reduce((a, b) => a + b, 0) / debitMonths.length
        : 0;
    const currentBalance = months[months.length - 1]?.closingBalance ?? null;
    const runwayMonths =
      currentBalance !== null && avgMonthlyBurn > 0
        ? currentBalance / avgMonthlyBurn
        : null;
    const deficitMonths = months.filter((m) => m.credit < m.debit).length;

    return {
      bankAccountId,
      accountName: account.accountName,
      currentBalance,
      avgMonthlyBurn,
      runwayMonths,
      deficitMonths,
      months,
    };
  });
});

export const getCategoryAnalytics = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      eq(dbSchema.financialTransaction.direction, "debit"),
      isNotNull(dbSchema.financialTransaction.categoryId),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
    with: { category: { with: { parent: true } } },
  });

  const heatmap = new Map<string, Map<string, number>>();
  const categoryTotals = new Map<string, number>();
  const merchantTotals = new Map<
    string,
    { amount: number; count: number; recurring: boolean }
  >();

  for (const transaction of transactions) {
    const amount = numericToNumber(transaction.amount);
    const key = monthKey(new Date(transaction.transactionDate));
    const categoryName = transaction.category?.name ?? "unknown";
    let monthRow = heatmap.get(key);
    if (!monthRow) {
      monthRow = new Map();
      heatmap.set(key, monthRow);
    }
    monthRow.set(categoryName, (monthRow.get(categoryName) || 0) + amount);
    categoryTotals.set(
      categoryName,
      (categoryTotals.get(categoryName) || 0) + amount,
    );

    if (transaction.merchantName) {
      const merchant = merchantTotals.get(transaction.merchantName) ?? {
        amount: 0,
        count: 0,
        recurring: false,
      };
      merchant.amount += amount;
      merchant.count += 1;
      merchant.recurring = merchant.recurring || transaction.isRecurring;
      merchantTotals.set(transaction.merchantName, merchant);
    }
  }

  return {
    heatmap: Array.from(heatmap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rawDate, categories]) => ({
        month: monthLabel(rawDate),
        rawDate,
        categories: Array.from(categories.entries()).map(
          ([category, amount]) => ({ category, amount }),
        ),
      })),
    categoryTotals: Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    topMerchants: Array.from(merchantTotals.entries())
      .map(([merchant, data]) => ({ merchant, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 20),
  };
});
