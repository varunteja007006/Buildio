import { and, eq, isNull } from "drizzle-orm";

import type { EnrichmentContext } from "./context";

const DAY_MS = 24 * 60 * 60 * 1000;

type Transaction =
  typeof import("@/lib/db/schema/financial-transaction.schema").financialTransaction.$inferSelect;

function amountsEqual(a: string | number, b: string | number): boolean {
  return Math.abs(Number(a) - Number(b)) < 0.005;
}

function nameOverlap(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  const words = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3),
    );
  const wordsA = words(a);
  const wordsB = words(b);
  if (wordsA.size === 0 || wordsB.size === 0) return false;
  for (const word of wordsA) {
    if (wordsB.has(word)) return true;
  }
  return false;
}

function pickBestMatch(debit: Transaction, candidates: Transaction[]) {
  const withNameOverlap = candidates.filter((candidate) =>
    nameOverlap(
      debit.counterpartyName ?? debit.merchantName,
      candidate.counterpartyName ?? candidate.merchantName,
    ),
  );
  const pool = withNameOverlap.length > 0 ? withNameOverlap : candidates;
  return pool.sort(
    (a, b) =>
      Math.abs(+a.transactionDate - +debit.transactionDate) -
      Math.abs(+b.transactionDate - +debit.transactionDate),
  )[0];
}

export async function matchTransfers(
  ctx: EnrichmentContext,
  opts: { dateWindowDays?: number } = {},
) {
  const { db, dbSchema, userId } = ctx;
  const dateWindowMs = (opts.dateWindowDays ?? 3) * DAY_MS;

  const unlinked = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, userId),
      isNull(dbSchema.financialTransaction.linkedTransactionId),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
  });

  const debits = unlinked.filter(
    (transaction) =>
      transaction.direction === "debit" && transaction.bankAccountId,
  );
  const credits = unlinked.filter(
    (transaction) =>
      transaction.direction === "credit" && transaction.bankAccountId,
  );

  const used = new Set<string>();
  let transfersCreated = 0;

  for (const debit of debits) {
    if (used.has(debit.id)) continue;

    const candidates = credits.filter(
      (credit) =>
        !used.has(credit.id) &&
        credit.bankAccountId !== debit.bankAccountId &&
        amountsEqual(credit.amount, debit.amount) &&
        Math.abs(+credit.transactionDate - +debit.transactionDate) <=
          dateWindowMs,
    );

    if (candidates.length === 0) continue;

    const best = pickBestMatch(debit, candidates);
    if (!best) continue;

    await db.transaction(async (tx) => {
      await tx.insert(dbSchema.transactionTransfer).values({
        fromTransactionId: debit.id,
        toTransactionId: best.id,
        amount: debit.amount,
      });
      await tx
        .update(dbSchema.financialTransaction)
        .set({
          isTransfer: true,
          transactionType: "transfer",
          linkedTransactionId: best.id,
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.financialTransaction.id, debit.id));
      await tx
        .update(dbSchema.financialTransaction)
        .set({
          isTransfer: true,
          transactionType: "transfer",
          linkedTransactionId: debit.id,
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.financialTransaction.id, best.id));
    });

    used.add(debit.id);
    used.add(best.id);
    transfersCreated += 1;
  }

  return { transfersCreated };
}
