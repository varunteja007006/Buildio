import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";
import { zodSchema } from "@/lib/db/zod-schema";

const updateProfileInput = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional(),
});

export const userProfileRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const profile = await db.query.userProfile.findFirst({
      where: eq(dbSchema.userProfile.user_id, user.id),
    });

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    return profile;
  }),

  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const profile = await db.query.userProfile.findFirst({
        where: eq(dbSchema.userProfile.user_id, user.id),
      });

      if (!profile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const [updated] = await db
        .update(dbSchema.userProfile)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.userProfile.user_id, user.id))
        .returning();

      return updated;
    }),
});
