import React from "react";

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { db, dbSchema, zodSchema } from "@/lib/db";
import { z, ZodError } from "zod/v4";

const isDev = process.env.NEXT_PUBLIC_ENV === "dev";

export const trpcSessionContext = React.cache(
  async (opts: { req: { headers: Headers } }) => {
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
  },
);

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
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  if (isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ next }) => {
    return next({
      ctx: { db, dbSchema, zodSchema },
    });
  });

// Utility function for protected tRPC procedures that require an authenticated user.
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
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
