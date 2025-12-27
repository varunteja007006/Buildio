import { useTRPC } from "@/lib/trpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Income source list
export const useIncomeSourceList = (params: {
  limit: number;
  page: number;
}) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.incomeSource.listSources.queryOptions({
      limit: params.limit,
      page: params.page,
    }),
  );
};

// Income source details
export function useIncomeSourceDetails(sourceId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.incomeSource.getSourceById.queryOptions({ sourceId }));
}

// Income source analytics
export const useIncomeSourceAnalytics = () => {
  const trpc = useTRPC();
  return useQuery(trpc.incomeSource.getAnalytics.queryOptions());
};

// Delete income source
export const useDeleteIncomeSource = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.incomeSource.deleteSource.mutationOptions({
      onSuccess: () => {
        toast.success("Income source deleted successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.incomeSource.listSources.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income source");
        options?.onError?.(error);
      },
    }),
  );
};

// Create income source
export function useCreateIncomeSource(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.incomeSource.createSource.mutationOptions({
      onSuccess: () => {
        toast.success("Income source created successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.incomeSource.listSources.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create income source");
        options?.onError?.(error);
      },
    }),
  );
}

// Update income source
export function useUpdateIncomeSource(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.incomeSource.updateSource.mutationOptions({
      onSuccess: (_data, variables) => {
        toast.success("Income source updated successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.incomeSource.listSources.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.incomeSource.getSourceById.queryKey({
            sourceId: variables.sourceId,
          }),
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update income source");
        options?.onError?.(error);
      },
    }),
  );
}
