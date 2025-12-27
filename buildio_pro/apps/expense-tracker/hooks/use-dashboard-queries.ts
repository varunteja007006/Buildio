"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";

// Dashboard query keys
const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
  budgets: () => [...dashboardKeys.all, "budgets"] as const,
  recent: () => [...dashboardKeys.all, "recent"] as const,
  categories: () => [...dashboardKeys.all, "categories"] as const,
};

// Overview summary
export function useDashboardSummary() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.overviewSummary.queryOptions());
}

// Active budgets with progress
export function useDashboardBudgets() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.activeBudgetsWithProgress.queryOptions());
}

// Recent transactions
export function useDashboardRecentTransactions() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.recentTransactions.queryOptions());
}

// Top categories
export function useDashboardTopCategories() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.topCategoriesThisMonth.queryOptions());
}

// Over budget analysis
export function useDashboardOverBudgetAnalysis() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.overBudgetAnalysis.queryOptions());
}

// Budget vs Actual History
export function useDashboardBudgetVsActualHistory() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.budgetVsActualHistory.queryOptions());
}

// Monthly Trends
export function useDashboardMonthlyTrends() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.monthlyTrends.queryOptions());
}

// Recurring Expenses
export function useDashboardRecurringExpenses() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.recurringExpenses.queryOptions());
}
