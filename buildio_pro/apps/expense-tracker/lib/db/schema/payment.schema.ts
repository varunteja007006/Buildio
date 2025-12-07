import { pgTable, text } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { relations } from "drizzle-orm";

export const paymentProvider = pgTable("payment_providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  ...auditTimeFields,
});

export const paymentProviderRelations = relations(
  paymentProvider,
  ({ many }) => ({
    paymentMethods: many(paymentMethods),
  }),
);

export const paymentMethods = pgTable("payment_methods", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  paymentProviderId: text("payment_provider_id")
    .notNull()
    .references(() => paymentProvider.id, { onDelete: "cascade" }),
  ...auditTimeFields,
});
