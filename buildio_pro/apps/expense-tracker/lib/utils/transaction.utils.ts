import { createHash } from "node:crypto";

export function computeTransactionHash(input: {
  bankAccountId?: string | null;
  date: Date;
  amount: string | number;
  referenceNumber?: string | null;
}): string {
  const raw = [
    input.bankAccountId ?? "",
    input.date.toISOString(),
    input.amount.toString(),
    input.referenceNumber ?? "",
  ].join("|");
  return createHash("sha256").update(raw).digest("hex");
}

export function needsReview(confidence: string | number | null): boolean {
  if (confidence === null || confidence === undefined) return false;
  return Number(confidence) < 0.8;
}
