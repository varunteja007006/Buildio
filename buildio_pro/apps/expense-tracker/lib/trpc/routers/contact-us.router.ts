import { createTRPCRouter, baseProcedure, protectedProcedure } from "../init";
import { contactUsInsertZSchema } from "@/lib/drizzle/db/zod/contact-us.zod";

export const contactUsRouter = createTRPCRouter({
  contactUsList: protectedProcedure.query(async ({ ctx }) => {
    const list = await ctx.db.query.contactUs.findMany();
    return list;
  }),
  // contactUsById: baseProcedure.input(z.string()).query(async (opts) => {
  //   const { input } = opts;
  //   const record = await db.query.contactUs.findFirst({
  //     with: {
  //       id: input,
  //     },
  //   });
  //   return record;
  // }),
  contactUsCreate: baseProcedure
    .input(contactUsInsertZSchema)
    .mutation(async ({ input, ctx }) => {
      const { db, schema } = ctx;
      const record = await db.insert(schema.contactUs).values(input);
      return record;
    }),
});
