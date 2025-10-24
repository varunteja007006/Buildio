import React from "react"

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { db, dbSchema, zodSchema } from "@/lib/db";

export const trpcSessionContext = React.cache(async (opts: {
  req: { headers: Headers };
}) => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const authSession = await auth.api.getSession({
    headers: opts.req.headers,
  });

  let user = null;

  if (authSession?.user) {
    user = {
      id: authSession?.user.id,
      name: authSession?.user.name,
      email: authSession?.user.email,
      emailVerified: authSession?.user.emailVerified,
    };
  }
  return { user };
});
type Context = Awaited<ReturnType<typeof trpcSessionContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure.use(({ next }) => {
  return next({
    ctx: { db, dbSchema, zodSchema },
  });
});

// Utility function for protected tRPC procedures that require an authenticated user.
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      user: ctx.user,
      db,
      dbSchema,
      zodSchema,
    },
  });
});
