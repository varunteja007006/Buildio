// Budget hooks
export {
  useBudgetList,
  useActiveBudgets,
  useBudgetDetails,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "./use-budget-queries";

// Expense hooks
export {
  useExpenseList,
  useExpenseDetails,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "./use-expense-queries";

// Income hooks
export {
  useIncomeList,
  useIncomeDetails,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
} from "./use-income-queries";

// Category and Source hooks
export {
  useExpenseCategoryList,
  useExpenseCategoryDetails,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from "./use-category-source-queries";

// Dashboard hooks
export {
  useDashboardSummary,
  useDashboardBudgets,
  useDashboardRecentTransactions,
  useDashboardTopCategories,
  useDashboardOverBudgetAnalysis,
  useDashboardBudgetVsActualHistory,
  useDashboardMonthlyTrends,
  useDashboardRecurringExpenses,
} from "./use-dashboard-queries";

// User hooks
export {
  useUserPreferencesQuery,
  useUpdateUserPreferences,
  useUserProfileQuery,
  useUpdateUserProfile,
} from "./use-user-queries";

export {
  useDeleteIncomeSource,
  useIncomeSourceAnalytics,
  useIncomeSourceList,
  useCreateIncomeSource,
  useUpdateIncomeSource,
  useIncomeSourceDetails,
  useDeleteMultipleIncomeSource,
} from "./use-income-sources";
