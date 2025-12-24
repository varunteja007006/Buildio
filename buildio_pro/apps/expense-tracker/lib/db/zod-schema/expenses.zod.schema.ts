import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { expense, expenseCategory } from "../schema/expenses.schema";

export const createExpenseSchema = createInsertSchema(expense).omit({
  userId: true,
});

export const updateExpenseSchema = createUpdateSchema(expense).omit({
  userId: true,
});

export const selectExpenseSchema = createSelectSchema(expense);

export const createExpenseCategorySchema = createInsertSchema(expenseCategory);
export const updateExpenseCategorySchema = createUpdateSchema(expenseCategory);
export const selectExpenseCategorySchema = createSelectSchema(expenseCategory);
