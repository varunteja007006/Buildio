import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { income, incomeSource } from "../schema/income.schema";

export const createIncomeSchema = createInsertSchema(income).omit({
  userId: true,
});

export const updateIncomeSchema = createUpdateSchema(income).omit({
  userId: true,
});

export const selectIncomeSchema = createSelectSchema(income);

export const createIncomeSourceSchema = createInsertSchema(incomeSource);
export const updateIncomeSourceSchema = createUpdateSchema(incomeSource);
export const selectIncomeSourceSchema = createSelectSchema(incomeSource);
