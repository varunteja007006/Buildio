import { createTRPCRouter } from "../init";
import {
  activeBudgetsWithProgress,
  overviewSummary,
  recentTransactions,
  topCategoriesThisMonth,
} from "./dashboard.queries";
import {
  budgetVsActualHistory,
  monthlyTrends,
  overBudgetAnalysis,
  recurringExpenses,
} from "./dashboard.trends";

export const dashboardRouter = createTRPCRouter({
  overviewSummary,
  activeBudgetsWithProgress,
  recentTransactions,
  topCategoriesThisMonth,
  overBudgetAnalysis,
  budgetVsActualHistory,
  monthlyTrends,
  recurringExpenses,
});
