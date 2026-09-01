import { and, asc, eq, isNull } from "drizzle-orm";

import type { EnrichmentContext } from "./context";

const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeName(value: string | null | undefined): string {
  return (value ?? "unknown").toLowerCase().replace(/\s+/g, " ").trim();
}

function hasRegularInterval(dates: number[], toleranceRatio = 0.2): boolean {
  if (dates.length < 3) return false;

  const deltas: number[] = [];
  for (let i = 1; i < dates.length; i += 1) {
    deltas.push(dates[i]! - dates[i - 1]!);
  }
  deltas.sort((a, b) => a - b);

  const median = deltas[Math.floor(deltas.length / 2)]!;
  if (median < 5 * DAY_MS || median > 366 * DAY_MS) return false;

  const tolerance = median * toleranceRatio;
  return deltas.every((delta) => Math.abs(delta - median) <= tolerance);
}

export async function detectRecurring(
  ctx: EnrichmentContext,
  opts: { minOccurrences?: number } = {},
) {
  const { db, dbSchema, userId } = ctx;
  const minOccurrences = opts.minOccurrences ?? 3;

  const debits = await db.query.financialTransaction.findMany({
    where: and(
      eq(dbSchema.financialTransaction.userId, userId),
      eq(dbSchema.financialTransaction.direction, "debit"),
      isNull(dbSchema.financialTransaction.supersededAt),
    ),
    orderBy: (transaction, { asc }) => asc(transaction.transactionDate),
  });

  const groups = new Map<string, typeof debits>();
  for (const transaction of debits) {
    const key = `${normalizeName(
      transaction.merchantName ?? transaction.description,
    )}|${Number(transaction.amount).toFixed(2)}`;
    const group = groups.get(key) ?? [];
    group.push(transaction);
    groups.set(key, group);
  }

  let recurringMarked = 0;

  for (const group of groups.values()) {
    if (group.length < minOccurrences) continue;

    const dates = group
      .map((transaction) => +new Date(transaction.transactionDate))
      .sort((a, b) => a - b);

    if (!hasRegularInterval(dates)) continue;

    for (const transaction of group) {
      if (transaction.isRecurring) continue;
      await db
        .update(dbSchema.financialTransaction)
        .set({
          isRecurring: true,
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.financialTransaction.id, transaction.id));
      recurringMarked += 1;
    }
  }

  return { recurringMarked };
}
