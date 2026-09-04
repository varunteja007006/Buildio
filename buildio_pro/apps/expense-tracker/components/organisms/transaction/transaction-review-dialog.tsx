"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Loader2 } from "lucide-react";
import * as React from "react";

import {
  useExpenseCategoryList,
  usePaymentMethodList,
  useTransactionConfirm,
  useTransactionUpdate,
} from "@/hooks";

import type { ReviewTransaction } from "./review/review-transaction";
import { TransactionFormFields } from "./review/transaction-form-fields";
import { TransactionSummary } from "./review/transaction-summary";
import { useReviewForm } from "./review/use-review-form";

export type { ReviewTransaction } from "./review/review-transaction";

export function TransactionReviewDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: ReviewTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: categoriesData } = useExpenseCategoryList({
    limit: 100,
    page: 1,
  });
  const { data: paymentMethods } = usePaymentMethodList();
  const confirmMutation = useTransactionConfirm({
    onSuccess: () => onOpenChange(false),
  });
  const updateMutation = useTransactionUpdate({
    onSuccess: () => onOpenChange(false),
  });

  const categories = categoriesData?.data ?? [];
  const { form, update, buildPayload } = useReviewForm(transaction, open);

  const isPending = confirmMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!transaction) return;
    updateMutation.mutate({ transactionId: transaction.id, ...buildPayload() });
  };

  const handleConfirm = () => {
    if (!transaction) return;
    confirmMutation.mutate({ transactionId: transaction.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review transaction</DialogTitle>
          <DialogDescription>
            {transaction?.statementUpload?.originalFilename ??
              "Extracted transaction"}
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="space-y-5">
            <TransactionSummary transaction={transaction} />
            <TransactionFormFields
              form={form}
              update={update}
              categories={categories}
              paymentMethods={paymentMethods ?? []}
            />
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="outline"
            disabled={isPending || !transaction?.needsReview}
            onClick={handleConfirm}
          >
            {confirmMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {transaction?.needsReview ? "Confirm as reviewed" : "Reviewed"}
          </Button>
          <Button disabled={isPending} onClick={handleSave}>
            {updateMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
