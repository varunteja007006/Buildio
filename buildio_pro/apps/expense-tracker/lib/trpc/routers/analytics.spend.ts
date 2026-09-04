import { and, eq, isNull } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  monthKey,
  monthLabel,
  numericToNumber,
} from "./analytics.helpers";

export const getCommitments = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
  });

  const byMonth = new Map<
    string,
    { committed: number; discretionary: number; total: number }
  >();

  for (const transaction of transactions) {
    if (transaction.direction !== "debit") continue;
    const amount = numericToNumber(transaction.amount);
    const key = monthKey(new Date(transaction.transactionDate));
    const month = byMonth.get(key) ?? {
      committed: 0,
      discretionary: 0,
      total: 0,
    };
    month.total += amount;
    const isCommitted =
      transaction.isEmi ||
      transaction.isRecurring ||
      transaction.transactionType === "insurance" ||
      transaction.transactionType === "loan_payment";
    if (isCommitted) {
      month.committed += amount;
    } else {
      month.discretionary += amount;
    }
    byMonth.set(key, month);
  }

  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([rawDate, m]) => ({
      month: monthLabel(rawDate),
      rawDate,
      committed: m.committed,
      discretionary: m.discretionary,
      total: m.total,
      committedRatio: m.total > 0 ? m.committed / m.total : 0,
    }));
});

export const getIncomeSavings = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
  });
  const incomes = await db.query.income.findMany({
    where: eq(dbSchema.income.userId, user.id),
    with: { source: true },
  });

  const byMonth = new Map<string, { income: number; expense: number }>();
  const sources = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.transactionType === "transfer") continue;
    const key = monthKey(new Date(transaction.transactionDate));
    const month = byMonth.get(key) ?? { income: 0, expense: 0 };
    const amount = numericToNumber(transaction.amount);
    if (
      transaction.direction === "credit" &&
      transaction.transactionType === "income"
    ) {
      month.income += amount;
    } else if (transaction.direction === "debit") {
      month.expense += amount;
    }
    byMonth.set(key, month);
  }

  for (const income of incomes) {
    sources.set(
      income.source?.name ?? "unknown",
      (sources.get(income.source?.name ?? "unknown") || 0) + 1,
    );
  }

  return {
    monthly: Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rawDate, m]) => ({
        month: monthLabel(rawDate),
        rawDate,
        income: m.income,
        expense: m.expense,
        savingsRate: m.income > 0 ? (m.income - m.expense) / m.income : 0,
      })),
    incomeStreams: Array.from(sources.entries()).map(([source, count]) => ({
      source,
      count,
    })),
  };
});

export const getLeakage = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      eq(dbSchema.financialTransaction.direction, "debit"),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
    with: { linkedTransaction: true },
  });

  const leakage = {
    fee: 0,
    interest: 0,
    cashWithdrawal: 0,
    roundUp: 0,
    total: 0,
  };
  const pendingRefunds: Array<{ merchant: string | null; amount: number }> =
    [];

  for (const transaction of transactions) {
    const amount = numericToNumber(transaction.amount);
    if (transaction.transactionType === "fee") leakage.fee += amount;
    if (transaction.transactionType === "interest")
      leakage.interest += amount;
    if (transaction.transactionType === "cash_withdrawal")
      leakage.cashWithdrawal += amount;
    if (transaction.transactionType === "round_up") leakage.roundUp += amount;
    if (
      transaction.transactionType === "refund" &&
      !transaction.linkedTransaction
    ) {
      pendingRefunds.push({ merchant: transaction.merchantName, amount });
    }
  }
  leakage.total =
    leakage.fee + leakage.interest + leakage.cashWithdrawal + leakage.roundUp;

  return { leakage, pendingRefunds };
});
