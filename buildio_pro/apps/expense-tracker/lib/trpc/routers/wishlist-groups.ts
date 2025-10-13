import { createTRPCRouter, baseProcedure, protectedProcedure } from "../init";
import { createWishListGroupZSchema } from "@/lib/drizzle/db/zod/wishlist-groups";

export const wishListGroups = createTRPCRouter({
  wishListGroups: protectedProcedure.query(async ({ ctx }) => {
    const list = await ctx.db.query.wishlistGroups.findMany({
      with: {
        user: true,
      },
      where: (wishListGroups, { eq }) => eq(wishListGroups.userId, ctx.user.id),
    });
    return list;
  }),
  wishListGroupCreate: baseProcedure
    .input(createWishListGroupZSchema)
    .mutation(async ({ input, ctx }) => {
      const { db, schema } = ctx;
      const record = await db.insert(schema.wishlistGroups).values(input);
      return record;
    }),
});
