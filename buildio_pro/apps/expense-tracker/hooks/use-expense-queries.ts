"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

// Query keys
const expenseKeys = {
  all: ["expense"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters: any) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

// List expenses
export function useExpenseList(params: {
  limit: number;
  offset: number;
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
        queryClient.invalidateQueries({ queryKey: expenseKeys.all });
        // Invalidate budgets (spent amounts change)
        queryClient.invalidateQueries({ queryKey: ["budget"] });
        // Invalidate dashboard
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
        // Invalidate specific expense
        queryClient.invalidateQueries({
          queryKey: expenseKeys.detail(variables.expenseId),
        });
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
        // Invalidate budgets
        queryClient.invalidateQueries({ queryKey: ["budget"] });
        // Invalidate dashboard
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
        // Invalidate all expense queries
        queryClient.invalidateQueries({ queryKey: expenseKeys.all });
        // Invalidate budgets
        queryClient.invalidateQueries({ queryKey: ["budget"] });
        // Invalidate dashboard
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense");
        options?.onError?.(error);
      },
    }),
  );
}
