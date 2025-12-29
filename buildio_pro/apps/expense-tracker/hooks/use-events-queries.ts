import { useTRPC } from "@/lib/trpc-client";
import { useQuery } from "@tanstack/react-query";

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
