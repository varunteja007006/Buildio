import {
  pgTable,
  text,
  numeric,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import { expense } from "./expenses.schema";

/**
 * Event schema for tracking major expenses/projects over time
 * Examples: Buying a property, Home renovation, Wedding, Car purchase, etc.
 */
export const eventStatus = pgTable("event_status", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  label: text("label").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isDefault: boolean("is_default").default(false).notNull(),
  ...auditTimeFields,
});

export const event = pgTable("event", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Buying a Property"
  description: text("description"), // e.g., "Purchase of residential property in downtown"
  estimatedBudget: numeric("estimated_budget"), // Optional: user's initial estimate
  startDate: timestamp("start_date"), // When the event started
  endDate: timestamp("end_date"), // When the event is expected to end (optional)
  statusId: text("status_id")
    // .notNull()
    .references(() => eventStatus.id, { onDelete: "restrict" }),
  ...auditTimeFields,
});

export const eventRelations = relations(event, ({ one, many }) => ({
  user: one(user, {
    fields: [event.userId],
    references: [user.id],
    relationName: "event_to_user",
  }),
  status: one(eventStatus, {
    fields: [event.statusId],
    references: [eventStatus.id],
    relationName: "event_to_status",
  }),
  expenses: many(eventExpense),
}));

/**
 * Junction table to link expenses to events
 * An expense can belong to one event
 * An event can have multiple expenses
 */
export const eventExpense = pgTable("event_expense", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id")
    .notNull()
    .references(() => event.id, { onDelete: "cascade" }),
  expenseId: text("expense_id")
    .notNull()
    .references(() => expense.id, { onDelete: "cascade" }),
  ...auditTimeFields,
});

export const eventExpenseRelations = relations(eventExpense, ({ one }) => ({
  event: one(event, {
    fields: [eventExpense.eventId],
    references: [event.id],
    relationName: "event_expense_to_event",
  }),
  expense: one(expense, {
    fields: [eventExpense.expenseId],
    references: [expense.id],
    relationName: "event_expense_to_expense",
  }),
}));
