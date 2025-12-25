"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

// Query keys for better invalidation management
const budgetKeys = {
  all: ["budget"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (filters: any) => [...budgetKeys.lists(), filters] as const,
  details: () => [...budgetKeys.all, "detail"] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
  active: () => [...budgetKeys.all, "active"] as const,
};

// List budgets
export function useBudgetList(params: {
  limit: number;
  offset: number;
  onlyActive?: boolean;
}) {
  const trpc = useTRPC();
  return useQuery(trpc.budget.budgetList.queryOptions(params));
}

// Active budgets
export function useActiveBudgets() {
  const trpc = useTRPC();
  return useQuery(trpc.budget.activeBudgets.queryOptions());
}

// Budget details
export function useBudgetDetails(budgetId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.budget.budgetDetails.queryOptions({ budgetId }));
}

// Create budget
export function useCreateBudget(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.budget.createBudget.mutationOptions({
      onSuccess: () => {
        toast.success("Budget created successfully!");
        // Invalidate all budget-related queries
        queryClient.invalidateQueries({ queryKey: budgetKeys.all });
        // Also invalidate dashboard queries since they depend on budgets
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create budget");
        options?.onError?.(error);
      },
    }),
  );
}

// Update budget
export function useUpdateBudget(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.budget.updateBudget.mutationOptions({
      onSuccess: (data, variables) => {
        toast.success("Budget updated successfully!");
        // Invalidate specific budget detail
        queryClient.invalidateQueries({
          queryKey: budgetKeys.detail(variables.budgetId),
        });
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
        // Invalidate dashboard
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update budget");
        options?.onError?.(error);
      },
    }),
  );
}

// Delete budget
export function useDeleteBudget(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.budget.deleteBudget.mutationOptions({
      onSuccess: () => {
        toast.success("Budget deleted successfully!");
        // Invalidate all budget queries
        queryClient.invalidateQueries({ queryKey: budgetKeys.all });
        // Invalidate dashboard
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete budget");
        options?.onError?.(error);
      },
    }),
  );
}
