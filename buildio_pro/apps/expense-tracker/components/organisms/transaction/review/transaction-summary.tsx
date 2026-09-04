"use client";

import { Badge } from "@workspace/ui/components/badge";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";

import { formatDateTime } from "./constants";
import type { ReviewTransaction } from "./review-transaction";

export function TransactionSummary({
  transaction,
}: {
  transaction: ReviewTransaction;
}) {
  return (
    <>
      <div className="rounded-md border bg-muted/40 p-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Raw description
          </span>
          <div className="flex items-center gap-2">
            <Badge
              variant={transaction.needsReview ? "destructive" : "secondary"}
              className="font-normal"
            >
              {transaction.needsReview ? "Needs review" : "Reviewed"}
            </Badge>
            {transaction.extractionConfidence != null && (
              <span className="text-xs text-muted-foreground">
                confidence {(transaction.extractionConfidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
        <p className="wrap-break-word font-mono text-sm">
          {transaction.rawDescription ?? "-"}
        </p>
        {transaction.referenceNumber && (
          <p className="mt-1 text-xs text-muted-foreground">
            Ref: {transaction.referenceNumber}
          </p>
        )}
      </div>

      <div className="rounded-md border p-3 text-xs text-muted-foreground">
        Current extracted amount:{" "}
        <span className="font-medium text-foreground">
          {formatCurrency(transaction.amount)}
        </span>{" "}
        · {transaction.direction === "credit" ? "credit" : "debit"} ·{" "}
        {transaction.paymentMethod?.name ?? "no method"} ·{" "}
        {transaction.category?.name ?? "uncategorized"}
        <div className="mt-1">
          Created {formatDateTime(transaction.createdAt)} · Updated{" "}
          {formatDateTime(transaction.updatedAt)}
        </div>
      </div>
    </>
  );
}
