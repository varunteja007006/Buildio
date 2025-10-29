import { appRouter, trpcSessionContext } from "@/lib/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: trpcSessionContext,
  });

export { handler as GET, handler as POST };
