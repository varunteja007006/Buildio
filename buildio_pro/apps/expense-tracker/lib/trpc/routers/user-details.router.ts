import { createTRPCRouter, protectedProcedure } from "../init";
// import { createUserPreferencesZSchema } from "@/lib/drizzle/db/zod/user-details.zod";

export const userDetailsRouter = createTRPCRouter({
  userPreferencesById: protectedProcedure.query(async ({ ctx }) => {
    const { id } = ctx.user;

    const record = await ctx.db.query.userPreferences.findMany({
      where: (userPreferences, { eq }) => eq(userPreferences.userId, id),
    });

    return record;
  }),
  //   contactUsCreate: baseProcedure
  //     .input(contactUsInsertZSchema)
  //     .mutation(async (opts) => {
  //       const { input } = opts;
  //       const record = await db.insert(schema.contactUs).values(input);
  //       return record;
  //     }),
});
