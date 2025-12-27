import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  investmentTypes,
  investmentPlatforms,
} from "../schema/investment.schema";

export const createInvestmentTypeSchema = createInsertSchema(investmentTypes);
export const updateInvestmentTypeSchema = createUpdateSchema(investmentTypes);
export const selectInvestmentTypeSchema = createSelectSchema(investmentTypes);

export const createInvestmentPlatformSchema = createInsertSchema(
  investmentPlatforms,
).omit({
  platformType: true,
});

export const updateInvestmentPlatformSchema = createUpdateSchema(
  investmentPlatforms,
).omit({
  platformType: true,
});

export const selectInvestmentPlatformSchema =
  createSelectSchema(investmentPlatforms);
