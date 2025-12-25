import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";
import { zodSchema } from "@/lib/db/zod-schema";

const updatePreferencesInput = z.object({
  currency: z.string().length(3).optional(),
  timezone: z.string().min(1).optional(),
});

export const userPreferencesRouter = createTRPCRouter({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const preferences = await db.query.userPreferences.findFirst({
      where: eq(dbSchema.userPreferences.user_id, user.id),
    });

    if (!preferences) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User preferences not found",
      });
    }

    return preferences;
  }),

  updatePreferences: protectedProcedure
    .input(updatePreferencesInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const preferences = await db.query.userPreferences.findFirst({
        where: eq(dbSchema.userPreferences.user_id, user.id),
      });

      if (!preferences) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User preferences not found",
        });
      }

      const [updated] = await db
        .update(dbSchema.userPreferences)
        .set({
          ...(input.currency && { currency: input.currency }),
          ...(input.timezone && { timezone: input.timezone }),
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.userPreferences.user_id, user.id))
        .returning();

      return updated;
    }),
});
