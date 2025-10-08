import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "../init";
import { db, schema } from "@/lib/drizzle";
import { contactUsInsertZSchema } from "@/lib/drizzle/db/zod/contact-us.zod";

export const contactUsRouter = createTRPCRouter({
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
