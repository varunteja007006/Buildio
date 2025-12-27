"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Pencil,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

import { useTRPC } from "@/lib/trpc-client";
import { BudgetDeleteDialog } from "@/components/organisms/budget/budget-delete-dialog";
import { useQuery } from "@tanstack/react-query";

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;
  const trpc = useTRPC();

  const budgetQuery = useQuery(
    trpc.budget.budgetDetails.queryOptions({ budgetId }),
  );

  if (budgetQuery.isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (budgetQuery.isError || !budgetQuery.data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Budget not found</p>
            <Link href="/budgets">
              <Button className="mt-4" variant="outline">
                Back to Budgets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { budget, expenses, totals } = budgetQuery.data;
  const isActive =
    new Date() >= new Date(budget.startMonth) &&
    new Date() <= new Date(budget.endMonth);
  const percentageUsed =
    totals.allocated > 0 ? (totals.spent / totals.allocated) * 100 : 0;

  const getProgressColor = () => {
    if (percentageUsed >= 100) return "text-red-500";
    if (percentageUsed >= 80) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {budget.name}
              </h1>
              {isActive && <Badge variant="default">Active</Badge>}
            </div>
            {budget.description && (
              <p className="text-muted-foreground mt-1">{budget.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/budgets/${budgetId}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <BudgetDeleteDialog
            budgetId={budgetId}
            budgetName={budget.name}
            onSuccess={() => router.push("/budgets")}
          />
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                ${totals.allocated.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className={`h-5 w-5 ${getProgressColor()}`} />
              <span className="text-2xl font-bold">
                ${totals.spent.toFixed(2)}
              </span>
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              {percentageUsed.toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp
                className={`h-5 w-5 ${
                  totals.remaining >= 0 ? "text-green-500" : "text-red-500"
                }`}
              />
              <span className="text-2xl font-bold">
                ${totals.remaining.toFixed(2)}
              </span>
            </div>
            {totals.remaining < 0 && (
              <p className="text-red-500 text-xs mt-1">Over budget!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Budget Progress</span>
              <span className={getProgressColor()}>
                {percentageUsed.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  percentageUsed >= 100
                    ? "bg-red-500"
                    : percentageUsed >= 80
                      ? "bg-orange-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Period */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(budget.startMonth).toLocaleDateString()} -{" "}
              {new Date(budget.endMonth).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Linked Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Expenses</CardTitle>
          <CardDescription>
            {expenses.length} expense(s) linked to this budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No expenses linked to this budget yet
            </p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{expense.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-semibold">
                    ${Number(expense.expenseAmount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
