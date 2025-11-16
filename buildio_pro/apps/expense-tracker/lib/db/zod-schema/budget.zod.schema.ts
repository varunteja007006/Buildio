import { z } from "zod";

import {
	createSelectSchema,
	createInsertSchema,
	createUpdateSchema,
} from "drizzle-zod";

import { budget } from "../schema/budget.schema";

export const createBudgetSchema = createInsertSchema(budget, {
	userId: z.string().optional(),
});

export const updateBudgetSchema = createUpdateSchema(budget, {
	userId: z.string().optional(),
});

export const selectBudgetSchema = createSelectSchema(budget);
