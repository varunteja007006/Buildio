import { and, eq, isNull } from "drizzle-orm";

import type { EnrichmentContext } from "./context";

const DAY_MS = 24 * 60 * 60 * 1000;

const REFUND_KEYWORDS = [
  "refund",
  "rfd",
  "reversal",
  "reimburse",
  "cashback",
];

function looksLikeRefund(transaction: {
  rawDescription: string | null;
  description: string | null;
  merchantName: string | null;
}): boolean {
  const text = [
    transaction.rawDescription,
    transaction.description,
    transaction.merchantName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return REFUND_KEYWORDS.some((keyword) => text.includes(keyword));
}

function amountsEqual(a: string | number, b: string | number): boolean {
  return Math.abs(Number(a) - Number(b)) < 0.005;
}

export async function linkRefunds(
  ctx: EnrichmentContext,
  opts: { windowDays?: number } = {},
) {
  const { db, dbSchema, userId } = ctx;
  const windowMs = (opts.windowDays ?? 14) * DAY_MS;

  const creditRows = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, userId),
      eq(dbSchema.financialTransaction.direction, "credit"),
      isNull(dbSchema.financialTransaction.linkedTransactionId),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
  });

  const debitRows = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, userId),
      eq(dbSchema.financialTransaction.direction, "debit"),
      isNull(dbSchema.financialTransaction.linkedTransactionId),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
  });

  const used = new Set<string>();
  let refundsLinked = 0;

  for (const credit of creditRows) {
    if (!looksLikeRefund(credit) || used.has(credit.id)) continue;

    const candidates = debitRows
      .filter(
        (debit) =>
          !used.has(debit.id) &&
          amountsEqual(debit.amount, credit.amount) &&
          +credit.transactionDate >= +debit.transactionDate &&
          +credit.transactionDate - +debit.transactionDate <= windowMs,
      )
      .sort((a, b) => +a.transactionDate - +b.transactionDate);

    if (candidates.length === 0) continue;

    const best = candidates[candidates.length - 1]!;

    await db
      .update(dbSchema.financialTransaction)
      .set({
        transactionType: "refund",
        linkedTransactionId: best.id,
        updatedAt: new Date(),
      })
      .where(eq(dbSchema.financialTransaction.id, credit.id));

    used.add(credit.id);
    used.add(best.id);
    refundsLinked += 1;
  }

  return { refundsLinked };
}
