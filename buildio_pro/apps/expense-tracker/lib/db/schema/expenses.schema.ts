import { boolean, numeric, pgTable, text } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const expense = pgTable("expense", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	categoryId: text("category_id")
		.notNull()
		.references(() => expenseCategory.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	expenseAmount: numeric("income").notNull(),
	isRecurring: boolean("is_recurring").default(false),
	...auditTimeFields,
});

export const expenseCategory = pgTable("expense_category", {
	id: text("id").primaryKey(),
	name: text("name").notNull(), // e.g., 'Groceries', 'Rent', 'Travel'
	...auditTimeFields,
});

export const expenseCategoryRelations = relations(
	expenseCategory,
	({ many }) => ({
		// An expense category can have many individual expense records
		expenses: many(expense),
	})
);

export const expenseRelations = relations(expense, ({ one }) => ({
	user: one(user, {
		fields: [expense.userId],
		references: [user.id],
		relationName: "expense_to_user",
	}),
	category: one(expenseCategory, {
		fields: [expense.categoryId],
		references: [expenseCategory.id],
		relationName: "expense_to_category",
	}),
}));
