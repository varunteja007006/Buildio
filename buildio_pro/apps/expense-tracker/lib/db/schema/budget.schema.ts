import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const budget = pgTable("budget", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  budgetAmount: numeric("budget_amount").notNull(),
  startMonth: timestamp("start_month").notNull(),
  endMonth: timestamp("end_month").notNull(),
  ...auditTimeFields,
});

export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, {
    fields: [budget.userId],
    references: [user.id],
    relationName: "budget_to_user",
  }),
}));
