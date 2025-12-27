"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

// List incomes
export function useIncomeList(params: { limit: number; page: number }) {
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
        queryClient.invalidateQueries({
          queryKey: trpc.income.listIncomes.queryKey(),
        });
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
          queryKey: trpc.income.listIncomes.queryKey(),
        });
        // Invalidate lists
        queryClient.invalidateQueries({
          queryKey: trpc.income.getIncomeById.queryKey(),
        });
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
        queryClient.invalidateQueries({
          queryKey: trpc.income.listIncomes.queryKey(),
        });
        // Invalidate dashboard
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income");
        options?.onError?.(error);
      },
    }),
  );
}
