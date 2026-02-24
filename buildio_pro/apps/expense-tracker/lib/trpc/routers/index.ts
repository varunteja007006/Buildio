import { createTRPCRouter } from "../init";
import { budgetRouter } from "./budget.router";
import { dashboardRouter } from "./dashboard.router";
import { eventRouter } from "./event.router";
import { expenseCategoryRouter } from "./expense-category.router";
import { expenseRouter } from "./expense.router";
import { incomeSourceRouter } from "./income-source.router";
import { incomeRouter } from "./income.router";
import { userPreferencesRouter } from "./user-preferences.router";
import { userProfileRouter } from "./user-profile.router";

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
