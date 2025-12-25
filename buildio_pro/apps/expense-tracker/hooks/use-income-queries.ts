"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

// Query keys
const incomeKeys = {
  all: ["income"] as const,
  lists: () => [...incomeKeys.all, "list"] as const,
  list: (filters: any) => [...incomeKeys.lists(), filters] as const,
  details: () => [...incomeKeys.all, "detail"] as const,
  detail: (id: string) => [...incomeKeys.details(), id] as const,
};

// List incomes
export function useIncomeList(params: {
  limit: number;
  offset: number;
  sourceId?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}) {
  const trpc = useTRPC();
  return useQuery(trpc.income.listIncomes.queryOptions(params));
}

// Income details
export function useIncomeDetails(incomeId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.income.getIncomeById.queryOptions({ incomeId }));
}

// Create income
export function useCreateIncome(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.income.createIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income created successfully!");
        // Invalidate income queries
        queryClient.invalidateQueries({ queryKey: incomeKeys.all });
        // Invalidate dashboard (balance changes)
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create income");
        options?.onError?.(error);
      },
    }),
  );
}

// Update income
export function useUpdateIncome(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.income.updateIncome.mutationOptions({
      onSuccess: (data, variables) => {
        toast.success("Income updated successfully!");
        // Invalidate specific income
        queryClient.invalidateQueries({
          queryKey: incomeKeys.detail(variables.incomeId),
        });
        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: incomeKeys.lists() });
        // Invalidate dashboard
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update income");
        options?.onError?.(error);
      },
    }),
  );
}

// Delete income
export function useDeleteIncome(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.income.deleteIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income deleted successfully!");
        // Invalidate all income queries
        queryClient.invalidateQueries({ queryKey: incomeKeys.all });
        // Invalidate dashboard
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income");
        options?.onError?.(error);
      },
    }),
  );
}
