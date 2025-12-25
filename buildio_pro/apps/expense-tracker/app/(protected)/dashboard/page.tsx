"use client";

import React from "react";
import Link from "next/link";
import { Loader2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import {
  useDashboardSummary,
  useDashboardBudgets,
  useDashboardRecentTransactions,
  useDashboardTopCategories,
} from "@/hooks";

export default function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const budgetsQuery = useDashboardBudgets();
  const recentQuery = useDashboardRecentTransactions();
  const topCategoriesQuery = useDashboardTopCategories();

  const isLoading =
    summaryQuery.isLoading ||
    budgetsQuery.isLoading ||
    recentQuery.isLoading ||
    topCategoriesQuery.isLoading;

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your finances this month
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Income (Month)
            </CardTitle>
            <CardDescription>Money earned this month</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(summaryQuery.data?.month.income || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Expenses (Month)
            </CardTitle>
            <CardDescription>Money spent this month</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(summaryQuery.data?.month.expenses || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Net (Month)
            </CardTitle>
            <CardDescription>Income minus expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(summaryQuery.data?.month.net || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Balance (All-time)
            </CardTitle>
            <CardDescription>Total income minus expenses</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(summaryQuery.data?.allTime.balance || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Active Budgets</CardTitle>
          <CardDescription>Progress of budgets currently active</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : budgetsQuery.data?.length ? (
            <div className="space-y-4">
              {budgetsQuery.data.map((b: any) => (
                <div key={b.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      <Link href={`/budgets/${b.id}`}>{b.name}</Link>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(b.spent)} / {formatCurrency(b.allocated)}
                    </div>
                  </div>
                  <Progress value={Math.min(b.percentSpent, 100)} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Remaining: {formatCurrency(Math.max(b.remaining, 0))}
                    </span>
                    {b.overBudget && <Badge variant="destructive">Over budget</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No active budgets found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 10 income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {recentQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentQuery.data?.length ? (
            <div className="divide-y">
              {recentQuery.data.map((t: any) => (
                <div key={`${t.type}-${t.id}`} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={t.type === "income" ? "default" : "secondary"}>
                      {t.type}
                    </Badge>
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground text-xs">{t.meta?.label}</span>
                  </div>
                  <div className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No recent transactions found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories (Month)</CardTitle>
          <CardDescription>Highest spending categories this month</CardDescription>
        </CardHeader>
        <CardContent>
          {topCategoriesQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : topCategoriesQuery.data?.length ? (
            <div className="space-y-2">
              {topCategoriesQuery.data.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground text-xs">{c.count} txns</span>
                  </div>
                  <div>{formatCurrency(c.totalSpent)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No category data for this month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>Track and manage budgets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/budgets">
              <Button className="w-full">View Budgets</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Add and review expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/expenses">
              <Button className="w-full">View Expenses</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income</CardTitle>
            <CardDescription>Record incoming payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/income">
              <Button className="w-full">View Income</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
