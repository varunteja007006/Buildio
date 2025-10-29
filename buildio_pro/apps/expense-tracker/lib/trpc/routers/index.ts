import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(async () => {
    return {
      message: "hello world",
    };
  }),

  helloUser: protectedProcedure.query(async ({ ctx }) => {
    return {
      message: `hello ${ctx.user.name}`,
    };
  }),

  createHello: publicProcedure
    .input(
      z.object({
        message: z
          .string()
          .min(4, "Minimum 4 chars")
          .max(15, "Maximum 15 chards"),
      }),
    )
    .mutation(async ({ input }) => {
      return {
        message: `hello, your message is ${input.message}`,
      };
    }),

  createHelloUser: protectedProcedure
    .input(
      z.object({
        message: z
          .string()
          .min(4, "Minimum 4 chars")
          .max(15, "Maximum 15 chards"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return {
        message: `hello ${ctx.user.name}, your message is ${input.message}`,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
