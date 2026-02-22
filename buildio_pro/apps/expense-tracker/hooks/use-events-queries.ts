import { useMutation, useQuery } from "@tanstack/react-query";
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
  return useMutation(
    trpc.event.createEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event created successfully!");
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
  return useMutation(
    trpc.event.updateEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event updated successfully!");
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

  return useMutation(
    trpc.event.deleteEvent.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted successfully");
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete event");
        options?.onError?.(error);
      },
    }),
  );
};
