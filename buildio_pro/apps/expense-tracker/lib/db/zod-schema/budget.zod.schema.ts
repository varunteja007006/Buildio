import { z } from "zod";

import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { budget } from "../schema/budget.schema";

export const createBudgetSchema = createInsertSchema(budget).omit({
  userId: true,
});

export const updateBudgetSchema = createUpdateSchema(budget).omit({
  userId: true,
});

export const selectBudgetSchema = createSelectSchema(budget);
