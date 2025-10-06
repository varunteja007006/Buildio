import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { db, schema } from "@/lib/drizzle";
import { contactUsInsertZSchema } from "@/lib/drizzle/db/schema/contact-us.schema";

export const appRouter = createTRPCRouter({
  contactUsList: baseProcedure.query(async () => {
    const list = await db.query.contactUs.findMany();
    return list;
  }),
  contactUsById: baseProcedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    const record = await db.query.contactUs.findFirst({
      with: {
        id: input,
      },
    });
    return record;
  }),
  contactUsCreate: baseProcedure
    .input(contactUsInsertZSchema)
    .mutation(async (opts) => {
      const { input } = opts;
      const record = await db.insert(schema.contactUs).values(input);
      return record;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
