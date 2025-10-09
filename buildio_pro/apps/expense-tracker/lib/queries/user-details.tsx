import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../trpc/client";

export const useGetUserPreference = () => {
  const trpc = useTRPC();
  return useQuery(trpc.userDetails.userPreferencesById.queryOptions());
};
