"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

// Query keys for expense categories
const expenseCategoryKeys = {
  all: ["expenseCategory"] as const,
  lists: () => [...expenseCategoryKeys.all, "list"] as const,
  list: (filters: any) => [...expenseCategoryKeys.lists(), filters] as const,
  details: () => [...expenseCategoryKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseCategoryKeys.details(), id] as const,
};

// List expense categories
export function useExpenseCategoryList(params: {
  limit: number;
  page: number;
}) {
  const trpc = useTRPC();
  return useQuery(trpc.expenseCategory.listCategories.queryOptions(params));
}

// Expense category details
export function useExpenseCategoryDetails(categoryId: string) {
  const trpc = useTRPC();
  return useQuery(
    trpc.expenseCategory.getCategoryById.queryOptions({ categoryId }),
  );
}

// Create expense category
export function useCreateExpenseCategory(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.expenseCategory.createCategory.mutationOptions({
      onSuccess: () => {
        toast.success("Expense category created successfully!");
        queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create expense category");
        options?.onError?.(error);
      },
    }),
  );
}

// Update expense category
export function useUpdateExpenseCategory(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.expenseCategory.updateCategory.mutationOptions({
      onSuccess: (data, variables) => {
        toast.success("Expense category updated successfully!");
        queryClient.invalidateQueries({
          queryKey: expenseCategoryKeys.detail(variables.categoryId),
        });
        queryClient.invalidateQueries({
          queryKey: expenseCategoryKeys.lists(),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update expense category");
        options?.onError?.(error);
      },
    }),
  );
}

// Delete expense category
export function useDeleteExpenseCategory(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.expenseCategory.deleteCategory.mutationOptions({
      onSuccess: () => {
        toast.success("Expense category deleted successfully!");
        queryClient.invalidateQueries({ queryKey: expenseCategoryKeys.all });
        // Also invalidate expenses since they reference categories
        queryClient.invalidateQueries({ queryKey: ["expense"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense category");
        options?.onError?.(error);
      },
    }),
  );
}

// Query keys for income sources
const incomeSourceKeys = {
  all: ["incomeSource"] as const,
  lists: () => [...incomeSourceKeys.all, "list"] as const,
  list: (filters: any) => [...incomeSourceKeys.lists(), filters] as const,
  details: () => [...incomeSourceKeys.all, "detail"] as const,
  detail: (id: string) => [...incomeSourceKeys.details(), id] as const,
};

// List income sources
export function useIncomeSourceList(params: { limit: number; page: number }) {
  const trpc = useTRPC();
  return useQuery(trpc.incomeSource.listSources.queryOptions(params));
}
