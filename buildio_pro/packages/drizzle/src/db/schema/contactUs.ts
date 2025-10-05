import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("contact_us", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 500 }),
  email: varchar({ length: 255 }).notNull().unique(),
});
