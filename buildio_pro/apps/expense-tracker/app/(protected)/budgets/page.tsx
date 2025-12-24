"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Plus, Calendar, DollarSign, Trash2, Pencil, Eye } from "lucide-react";

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
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function BudgetsPage() {
  const [page, setPage] = React.useState(0);
  const [onlyActive, setOnlyActive] = React.useState(false);
  const limit = 10;
  const trpc = useTRPC();

  const budgetListQuery = useQuery(
    trpc.budget.budgetList.queryOptions({
      limit,
      offset: page * limit,
      onlyActive,
    })
  );

  const activeBudgetsQuery = useQuery(
    trpc.budget.activeBudgets.queryOptions()
  );

  const totalPages = budgetListQuery.data?.meta
    ? Math.ceil(budgetListQuery.data.meta.totalItems / limit)
    : 0;

  const isLoading = budgetListQuery.isLoading || budgetListQuery.isFetching;

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Manage your monthly and yearly budgets
          </p>
        </div>
        <Link href="/budgets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </Link>
      </div>

      {/* Active Budgets Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Active Budgets</CardTitle>
          <CardDescription>Currently active budgets this month</CardDescription>
        </CardHeader>
        <CardContent>
          {activeBudgetsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activeBudgetsQuery.data?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active budgets found
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeBudgetsQuery.data?.map((budget: any) => (
                <Link
                  key={budget.id}
                  href={`/budgets/${budget.id}`}
                  className="block"
                >
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{budget.name}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {budget.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">
                          ${Number(budget.budgetAmount).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Button
          variant={onlyActive ? "default" : "outline"}
          onClick={() => {
            setOnlyActive(!onlyActive);
            setPage(0);
          }}
        >
          {onlyActive ? "Showing Active" : "Show Active Only"}
        </Button>
      </div>

      {/* Budget List */}
      <Card>
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
          <CardDescription>
            {budgetListQuery.data?.meta
              ? `${budgetListQuery.data.meta.totalItems} total budget(s)`
              : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : budgetListQuery.data?.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No budgets found. Create your first budget!
              </p>
              <Link href="/budgets/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Budget
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetListQuery.data?.data.map((budget: any) => {
                const isActive =
                  new Date() >= new Date(budget.startMonth) &&
                  new Date() <= new Date(budget.endMonth);

                return (
                  <Card key={budget.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {budget.name}
                            </h3>
                            {isActive && (
                              <Badge variant="default">Active</Badge>
                            )}
                          </div>
                          {budget.description && (
                            <p className="text-muted-foreground text-sm">
                              {budget.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(budget.startMonth).toLocaleDateString()} -{" "}
                                {new Date(budget.endMonth).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold">
                                ${Number(budget.budgetAmount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/budgets/${budget.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/budgets/${budget.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <BudgetDeleteDialog
                            budgetId={budget.id}
                            budgetName={budget.name}
                            onSuccess={() => {
                              budgetListQuery.refetch();
                              activeBudgetsQuery.refetch();
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1 || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
