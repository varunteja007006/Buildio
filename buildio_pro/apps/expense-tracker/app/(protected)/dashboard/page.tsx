"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarClock,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import {
  useDashboardSummary,
  useDashboardBudgets,
  useDashboardRecentTransactions,
  useDashboardTopCategories,
  useDashboardOverBudgetAnalysis,
  useDashboardBudgetVsActualHistory,
  useDashboardMonthlyTrends,
  useDashboardRecurringExpenses,
} from "@/hooks";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TopCategories } from "@/components/dashboard/top-categories";
import { MonthlyTrends } from "@/components/dashboard/monthly-trends";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const budgetsQuery = useDashboardBudgets();
  const recentQuery = useDashboardRecentTransactions();
  const topCategoriesQuery = useDashboardTopCategories();
  const overBudgetQuery = useDashboardOverBudgetAnalysis();
  const historyQuery = useDashboardBudgetVsActualHistory();
  const monthlyTrendsQuery = useDashboardMonthlyTrends();
  const recurringExpensesQuery = useDashboardRecurringExpenses();

  const alerts = React.useMemo(() => {
    if (!budgetsQuery.data) return [];
    const activeAlerts = [];
    for (const b of budgetsQuery.data) {
      if (b.percentSpent >= 100) {
        activeAlerts.push({
          id: b.id,
          variant: "destructive" as const,
          title: "Budget Exceeded",
          message: `You have exceeded your budget "${b.name}" by ${formatCurrency(b.spent - b.allocated)}.`,
          icon: AlertCircle,
        });
      } else if (b.percentSpent >= 90) {
        activeAlerts.push({
          id: b.id,
          variant: "destructive" as const,
          title: "Critical Budget Alert",
          message: `You have used ${b.percentSpent}% of your budget "${b.name}".`,
          icon: AlertTriangle,
        });
      } else if (b.percentSpent >= 80) {
        activeAlerts.push({
          id: b.id,
          variant: "default" as const,
          title: "Budget Warning",
          message: `You have used ${b.percentSpent}% of your budget "${b.name}".`,
          icon: AlertTriangle,
          className: "border-yellow-500 text-yellow-600 [&>svg]:text-yellow-600",
        });
      }
    }
    return activeAlerts;
  }, [budgetsQuery.data]);

  // Calculate trends
  const trends = monthlyTrendsQuery.data || [];
  const lastMonth = trends[trends.length - 1];
  const prevMonth = trends[trends.length - 2];

  const incomeTrend =
    prevMonth && lastMonth && prevMonth.income > 0
      ? ((lastMonth.income - prevMonth.income) / prevMonth.income) * 100
      : undefined;
  const expenseTrend =
    prevMonth && lastMonth && prevMonth.expense > 0
      ? ((lastMonth.expense - prevMonth.expense) / prevMonth.expense) * 100
      : undefined;

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your finances this month
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/expenses/add">
                <Button>Add Expense</Button>
            </Link>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.variant}
              className={alert.className}
            >
              <alert.icon className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Income (Month)"
          value={formatCurrency(summaryQuery.data?.month.income || 0)}
          icon={TrendingUp}
          trend={incomeTrend}
          loading={summaryQuery.isLoading}
          className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20"
        />
        <SummaryCard
          title="Expenses (Month)"
          value={formatCurrency(summaryQuery.data?.month.expenses || 0)}
          icon={TrendingDown}
          trend={expenseTrend}
          loading={summaryQuery.isLoading}
          className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/20"
        />
        <SummaryCard
          title="Net (Month)"
          value={formatCurrency(summaryQuery.data?.month.net || 0)}
          icon={Wallet}
          description="Income minus expenses"
          loading={summaryQuery.isLoading}
        />
        <SummaryCard
          title="Balance (All-time)"
          value={formatCurrency(summaryQuery.data?.allTime.balance || 0)}
          icon={Wallet}
          description="Total accumulated"
          loading={summaryQuery.isLoading}
        />
      </div>

      {/* Main Grid Layout (Bento Box) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Charts) */}
        <div className="md:col-span-2 space-y-6">
          <MonthlyTrends
            data={monthlyTrendsQuery.data || []}
            isLoading={monthlyTrendsQuery.isLoading}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Active Budgets */}
            <Card className="col-span-1">
                <CardHeader>
                <CardTitle>Active Budgets</CardTitle>
                <CardDescription>
                    Progress of budgets currently active
                </CardDescription>
                </CardHeader>
                <CardContent>
                {budgetsQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : budgetsQuery.data?.length ? (
                    <div className="space-y-6">
                    {budgetsQuery.data.slice(0, 4).map((b: any) => (
                        <div key={b.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="font-medium truncate max-w-[150px]">
                            <Link href={`/budgets/${b.id}`} className="hover:underline">{b.name}</Link>
                            </div>
                            <div className="text-sm text-muted-foreground">
                            {Math.round(b.percentSpent)}%
                            </div>
                        </div>
                        <Progress value={Math.min(b.percentSpent, 100)} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                            {formatCurrency(b.spent)} of {formatCurrency(b.allocated)}
                            </span>
                            {b.overBudget && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Over</Badge>
                            )}
                        </div>
                        </div>
                    ))}
                    {budgetsQuery.data.length > 4 && (
                        <div className="pt-2 text-center">
                            <Link href="/budgets" className="text-sm text-primary hover:underline">View all budgets</Link>
                        </div>
                    )}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8 text-sm">
                    No active budgets found
                    </p>
                )}
                </CardContent>
            </Card>

            {/* Recurring Expenses */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Recurring</CardTitle>
                    <CardDescription>Upcoming payments</CardDescription>
                </CardHeader>
                <CardContent>
                    {recurringExpensesQuery.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                    ) : recurringExpensesQuery.data?.length ? (
                    <div className="space-y-4">
                        {recurringExpensesQuery.data.slice(0, 4).map((expense: any) => (
                        <div key={expense.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <CalendarClock className="h-4 w-4" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-medium truncate text-sm">{expense.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{expense.category?.name || 'Uncategorized'}</p>
                            </div>
                            </div>
                            <div className="font-bold text-sm">
                            {formatCurrency(expense.expenseAmount)}
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No recurring expenses
                    </div>
                    )}
                </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <TopCategories
            data={topCategoriesQuery.data || []}
            isLoading={topCategoriesQuery.isLoading}
          />
          
          <RecentTransactions
            transactions={recentQuery.data || []}
            isLoading={recentQuery.isLoading}
          />
        </div>
      </div>
      
      {/* Over Budget Analysis (Full Width if exists) */}
      {overBudgetQuery.data && overBudgetQuery.data.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Over Budget Analysis
            </CardTitle>
            <CardDescription>
              Top contributing categories for over-spent budgets
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {overBudgetQuery.data.map((item: any) => (
                <div key={item.budgetId} className="space-y-3 bg-background p-4 rounded-lg border">
                    <div className="flex items-center justify-between font-medium">
                    <span>{item.budgetName}</span>
                    <span className="text-destructive text-sm">
                        {formatCurrency(item.spent)} / {formatCurrency(item.allocated)}
                    </span>
                    </div>
                    <div className="space-y-2">
                    {item.topCategories.map((cat: any) => (
                        <div key={cat.name} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <span className="font-medium">
                            {formatCurrency(cat.amount)}
                        </span>
                        </div>
                    ))}
                    </div>
                </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
