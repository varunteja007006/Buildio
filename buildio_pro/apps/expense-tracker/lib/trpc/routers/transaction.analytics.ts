import { and, eq, isNull } from "drizzle-orm";

import { needsReview } from "@/lib/utils/transaction.utils";

import { protectedProcedure } from "../init";
import { numericToNumber } from "./transaction.schemas";

export const getAnalytics = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  const transactions = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, user.id),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
    with: {
      statementUpload: true,
      bankAccount: true,
    },
  });

  const typeMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const monthMap = new Map<string, number>();
  // bankAccountId -> "YYYY-MM" -> { debit, credit }
  const accountMonthMap = new Map<
    string,
    Map<string, { debit: number; credit: number }>
  >();
  const accountSet = new Set<string>();
  let totalDebit = 0;
  let totalCredit = 0;
  let reviewCount = 0;

  for (const transaction of transactions) {
    const amount = numericToNumber(transaction.amount);
    if (transaction.direction === "debit") {
      totalDebit += amount;
    } else {
      totalCredit += amount;
    }
    if (
      needsReview(transaction.extractionConfidence, transaction.reviewedAt)
    ) {
      reviewCount += 1;
    }

    typeMap.set(
      transaction.transactionType,
      (typeMap.get(transaction.transactionType) || 0) + amount,
    );

    const categoryName = transaction.categoryId ?? "uncategorized";
    categoryMap.set(
      categoryName,
      (categoryMap.get(categoryName) || 0) + amount,
    );

    const d = new Date(transaction.transactionDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + amount);

    const accountId = transaction.bankAccountId ?? "unknown";
    accountSet.add(accountId);
    let monthForAccount = accountMonthMap.get(accountId);
    if (!monthForAccount) {
      monthForAccount = new Map();
      accountMonthMap.set(accountId, monthForAccount);
    }
    const entry = monthForAccount.get(key) ?? { debit: 0, credit: 0 };
    if (transaction.direction === "debit") {
      entry.debit += amount;
    } else {
      entry.credit += amount;
    }
    monthForAccount.set(key, entry);
  }

  const typeBreakdown = Array.from(typeMap.entries())
    .map(([type, amount]) => ({ type, amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyBreakdown = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([rawDate, amount]) => {
      const [year, month] = rawDate.split("-");
      const date = new Date(parseInt(year!), parseInt(month!) - 1);
      return {
        month: date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        amount,
        rawDate,
      };
    });

  const accountsById = new Map(
    transactions
      .map((t) => t.bankAccount)
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .map((a) => [a.id, a]),
  );
  const statementDocumentTypeByAccount = new Map<string, string | null>();
  for (const transaction of transactions) {
    if (transaction.bankAccountId && transaction.statementUpload) {
      statementDocumentTypeByAccount.set(
        transaction.bankAccountId,
        transaction.statementUpload.documentType,
      );
    }
  }

  const perAccountMonthlyBreakdown = Array.from(accountMonthMap.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([bankAccountId, monthForAccount]) => {
      const account = accountsById.get(bankAccountId);
      const months = Array.from(monthForAccount.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([rawDate, entry]) => {
          const [year, month] = rawDate.split("-");
          const date = new Date(parseInt(year!), parseInt(month!) - 1);
          return {
            month: date.toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
            rawDate,
            debit: entry.debit,
            credit: entry.credit,
            net: entry.credit - entry.debit,
          };
        });
      return {
        bankAccountId,
        accountName: account?.name ?? null,
        documentType:
          statementDocumentTypeByAccount.get(bankAccountId) ?? null,
        months,
      };
    });

  return {
    totalDebit,
    totalCredit,
    net: totalCredit - totalDebit,
    reviewCount,
    typeBreakdown,
    categoryBreakdown: Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => ({ categoryId, amount }))
      .sort((a, b) => b.amount - a.amount),
    monthlyBreakdown,
    perAccountMonthlyBreakdown,
  };
});
