"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";

import { useTRPC } from "@/lib/trpc-client";
import type { AppRouter } from "@/lib/trpc";

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

export function usePaymentMethodList() {
  const trpc = useTRPC();
  return useQuery(trpc.transaction.listPaymentMethods.queryOptions());
}

export function useBankAccountList() {
  const trpc = useTRPC();
  return useQuery(trpc.transaction.listBankAccounts.queryOptions());
}

export type BankAccountListItem =
  inferRouterOutputs<AppRouter>["transaction"]["listBankAccounts"][number];

export function useTransactionConfirm(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.transaction.confirmTransaction.mutationOptions({
      onSuccess: () => {
        toast.success("Transaction marked as reviewed.");
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listTransactions.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAnalytics.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to confirm transaction",
        );
        options?.onError?.(error);
      },
    }),
  );
}

export function useTransactionDelete(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.transaction.deleteTransaction.mutationOptions({
      onSuccess: () => {
        toast.success("Transaction deleted.");
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listTransactions.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listByStatement.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAnalytics.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete transaction",
        );
        options?.onError?.(error);
      },
    }),
  );
}

export function useTransactionBulkDelete(options?: {
  onSuccess?: (data: { deletedIds: string[] }) => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.transaction.deleteTransactions.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `${data.deletedIds.length} transaction${data.deletedIds.length === 1 ? "" : "s"} deleted.`,
        );
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listTransactions.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listByStatement.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAnalytics.queryKey(),
        });
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete transactions",
        );
        options?.onError?.(error);
      },
    }),
  );
}

export function useTransactionUpdate(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.transaction.updateTransaction.mutationOptions({
      onSuccess: () => {
        toast.success("Transaction updated.");
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listTransactions.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAnalytics.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to update transaction",
        );
        options?.onError?.(error);
      },
    }),
  );
}
