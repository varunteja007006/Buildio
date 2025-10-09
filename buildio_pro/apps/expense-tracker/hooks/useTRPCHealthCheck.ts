import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function useTRPCHealthCheck() {
  const trpc = useTRPC();
  const health = useQuery(trpc.health.checkRouter.queryOptions());
  const protectedHealth = useQuery(
    trpc.health.checkProtectedRouter.queryOptions()
  );
  
  return {
    health: health.data,
    protectedHealth: protectedHealth.data,
  };
}
