import { createHash } from "node:crypto";

/**
 * Tier-1 dedup hash: only transactions with a statement-printed reference
 * number get one, since that's the only field stable across extraction runs.
 * Returns null otherwise (the DB column is nullable; NULLs never collide in
 * the unique index, so reference-less rows are not deduplicated).
 */
export function computeTransactionHash(input: {
  bankAccountId?: string | null;
  date: string;
  amount: string | number;
  referenceNumber?: string | null;
}): string | null {
  const referenceNumber = input.referenceNumber?.trim();
  if (!referenceNumber) return null;
  const raw = [
    input.bankAccountId ?? "",
    referenceNumber,
    input.date,
    Number(input.amount).toFixed(2),
  ].join("|");
  return createHash("sha256").update(raw).digest("hex");
}

export function needsReview(
  confidence: string | number | null | undefined,
  reviewedAt?: Date | string | null,
): boolean {
  if (confidence === null || confidence === undefined) return false;
  if (reviewedAt) return false;
  return Number(confidence) < 0.8;
}
