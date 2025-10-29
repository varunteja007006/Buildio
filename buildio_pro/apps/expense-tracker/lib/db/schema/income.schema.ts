import { pgTable, text, numeric } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const incomeSource = pgTable("income_source", {
	id: text("id").primaryKey(), // serial auto-increments to bigint
	name: text("name").notNull(),
	description: text("name"),
	...auditTimeFields,
});

export const income = pgTable("income", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	name: text("name"),
	sourceId: text("source_id")
		.notNull()
		.references(() => incomeSource.id, { onDelete: "cascade" }),
	incomeAmount: numeric("income").notNull(),
	...auditTimeFields,
});

export const incomeSourceRelations = relations(incomeSource, ({ many }) => ({
	incomes: many(income), // An income source can have many income entries
}));

export const incomeRelations = relations(income, ({ one }) => ({
	// Relation to the user who recorded the income
	user: one(user, {
		fields: [income.userId],
		references: [user.id],
		relationName: "income_to_user",
	}),
	// Relation to the source of the income (e.g., 'Salary', 'Freelance')
	source: one(incomeSource, {
		fields: [income.sourceId],
		references: [incomeSource.id],
		relationName: "income_to_source",
	}),
}));
