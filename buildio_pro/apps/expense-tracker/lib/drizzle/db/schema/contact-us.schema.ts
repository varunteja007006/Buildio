import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

export const contactUs = pgTable("contact_us", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 500 }),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 15 }),
});

export const contactUsSelectZSchema = createSelectSchema(contactUs);
export const contactUsInsertZSchema = createInsertSchema(contactUs);
export const contactUsUpdateZSchema = createUpdateSchema(contactUs);
