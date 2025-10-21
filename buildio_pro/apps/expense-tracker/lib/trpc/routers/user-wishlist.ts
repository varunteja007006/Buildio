import { createTRPCRouter, baseProcedure, protectedProcedure } from "../init";
import { createWishListGroupZSchema } from "@/lib/drizzle/db/zod/user-wishlist";

export const wishlistGroups = createTRPCRouter({
  wishlistGroups: protectedProcedure.query(async ({ ctx }) => {
    const list = await ctx.db.query.wishlistGroups.findMany({
      with: {
        user: true,
      },
      where: (wishlistGroups, { eq }) => eq(wishlistGroups.userId, ctx.user.id),
    });
    return list;
  }),
  wishlistGroupCreate: baseProcedure
    .input(createWishListGroupZSchema)
    .mutation(async ({ input, ctx }) => {
      const { db, schema } = ctx;
      const record = await db.insert(schema.wishlistGroups).values(input);
      return record;
    }),
});
