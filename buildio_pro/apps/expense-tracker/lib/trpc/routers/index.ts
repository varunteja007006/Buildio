import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

import { budgetRouter } from "./budget.router";
import { expenseRouter } from "./expense.router";
import { expenseCategoryRouter } from "./expense-category.router";
import { incomeRouter } from "./income.router";
import { incomeSourceRouter } from "./income-source.router";
import { dashboardRouter } from "./dashboard.router";
import { userPreferencesRouter } from "./user-preferences.router";
import { userProfileRouter } from "./user-profile.router";
import { eventRouter } from "./event.router";

export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  budget: budgetRouter,
  expense: expenseRouter,
  expenseCategory: expenseCategoryRouter,
  income: incomeRouter,
  incomeSource: incomeSourceRouter,
  userPreferences: userPreferencesRouter,
  userProfile: userProfileRouter,
  event: eventRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
