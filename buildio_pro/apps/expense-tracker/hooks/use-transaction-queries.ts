"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc-client";

export type TransactionDirection = "debit" | "credit";

export type TransactionType =
  | "expense"
  | "income"
  | "transfer"
  | "investment"
  | "loan_payment"
  | "insurance"
  | "refund"
  | "interest"
  | "fee"
  | "cash_withdrawal"
  | "round_up"
  | "unknown";

export function useTransactionList(params: {
  limit: number;
  page: number;
  bankAccountId?: string;
  categoryId?: string;
  paymentMethodId?: string;
  statementUploadId?: string;
  direction?: TransactionDirection;
  transactionType?: TransactionType;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  markForReviewOnly?: boolean;
}) {
  const trpc = useTRPC();
  return useQuery(trpc.transaction.listTransactions.queryOptions(params));
}

export function useTransactionDetails(transactionId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.transaction.getTransactionById.queryOptions({ transactionId }),
  );
}

export function useTransactionAnalytics() {
  const trpc = useTRPC();
  return useQuery(trpc.transaction.getAnalytics.queryOptions());
}

export function useStatementTransactions(statementUploadId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.transaction.listByStatement.queryOptions({ statementUploadId }),
  );
}

export function useRunTransactionEnrichment(options?: {
  onSuccess?: (data: {
    transfersCreated: number;
    refundsLinked: number;
    recurringMarked: number;
  }) => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.transaction.runEnrichment.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `Enrichment complete: ${data.transfersCreated} transfers, ${data.refundsLinked} refunds, ${data.recurringMarked} recurring`,
        );
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listTransactions.queryKey(),
        });
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Enrichment failed",
        );
        options?.onError?.(error);
      },
    }),
  );
}
