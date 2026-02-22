"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc-client";

// List expenses
export function useExpenseList(params: {
  limit: number;
  page: number;
  categoryId?: string;
  budgetId?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}) {
  const trpc = useTRPC();
  return useQuery(trpc.expense.listExpenses.queryOptions(params));
}

// Expense details
export function useExpenseDetails(expenseId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.expense.getExpenseById.queryOptions({ expenseId }));
}

// Create expense
export function useCreateExpense(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.expense.createExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense created successfully!");
        // Invalidate expense queries
        queryClient.invalidateQueries({
          queryKey: trpc.expense.listExpenses.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create expense");
        options?.onError?.(error);
      },
    }),
  );
}

// Update expense
export function useUpdateExpense(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.expense.updateExpense.mutationOptions({
      onSuccess: (data, variables) => {
        toast.success("Expense updated successfully!");
        // Invalidate expense queries
        queryClient.invalidateQueries({
          queryKey: trpc.expense.listExpenses.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update expense");
        options?.onError?.(error);
      },
    }),
  );
}

// Delete expense
export function useDeleteExpense(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.expense.deleteExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense deleted successfully!");
        // Invalidate expense queries
        queryClient.invalidateQueries({
          queryKey: trpc.expense.listExpenses.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense");
        options?.onError?.(error);
      },
    }),
  );
}

// Delete multiple expenses
export function useDeleteExpenses(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.expense.deleteExpenses.mutationOptions({
      onSuccess: () => {
        toast.success("Expenses deleted successfully!");
        // Invalidate expense queries
        queryClient.invalidateQueries({
          queryKey: trpc.expense.listExpenses.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense");
        options?.onError?.(error);
      },
    }),
  );
}

export function useGetExpenseByID(expenseId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.expense.getExpenseById.queryOptions({ expenseId }));
}
