import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc-client";

export const useEventsList = (options: { limit: number; page: number }) => {
  const trpc = useTRPC();
  return useQuery(
    trpc.event.listEvents.queryOptions({
      limit: options.limit,
      page: options.page,
      // statusId: options.statusFilter === "all" ? undefined : options.statusFilter,
    }),
  );
};

export const useEventListStatues = () => {
  const trpc = useTRPC();
  return useQuery(trpc.event.listStatuses.queryOptions());
};

export const useEventCreate = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.event.createEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event created successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.event.listEvents.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create event");
        options?.onError?.(error);
      },
    }),
  );
};

export const useEventUpdate = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.event.updateEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event updated successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.event.listEvents.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error((error as any).message || "Failed to update event");
        options?.onError?.(error);
      },
    }),
  );
};

export const useEventDelete = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.event.deleteEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.event.listEvents.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete event");
        options?.onError?.(error);
      },
    }),
  );
};

export const useEventSpendingHistory = (eventId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.event.getEventSpendingHistory.queryOptions({ eventId }));
};

export const useGetEventById = (eventId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.event.getEventById.queryOptions({ eventId }));
};

export const useGetUnLinkedExpenses = (eventId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.event.getUnlinkedExpenses.queryOptions({ eventId }));
};

export const useRemoveLinkedExpense = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.event.removeExpenseFromEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Expense removed successfully");

        // invalidate queries
        queryClient.invalidateQueries({
          queryKey: trpc.event.getUnlinkedExpenses.queryKey(),
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.event.getEventById.queryKey(),
          exact: false,
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to remove expense");
        options?.onError?.(error);
      },
    }),
  );
};

export const useLinkingExpenseToEvent = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.event.addExpenseToEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Expenses added successfully");

        // invalidate queries
        queryClient.invalidateQueries({
          queryKey: trpc.event.getUnlinkedExpenses.queryKey(),
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: trpc.event.getEventById.queryKey(),
          exact: false,
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to add expenses");
        options?.onError?.(error);
      },
    }),
  );
};
