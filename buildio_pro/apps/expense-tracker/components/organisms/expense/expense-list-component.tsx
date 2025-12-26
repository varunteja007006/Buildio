"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@workspace/ui/components/chart";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";

import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TransactionTable, Transaction } from "@/components/transactions/transaction-table";
import { FilterBar } from "@/components/transactions/filter-bar";
import { useExpenseCategoryList, useBudgetList } from "@/hooks";

interface ExpenseListComponentProps {
  categoryId?: string;
  budgetId?: string;
}

export function ExpenseListComponent({
  categoryId: initialCategoryId,
  budgetId: initialBudgetId,
}: ExpenseListComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const [limit, setLimit] = React.useState(10);
  const [offset, setOffset] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  
  // Filter states
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(initialCategoryId);
  const [selectedBudget, setSelectedBudget] = React.useState<string | undefined>(initialBudgetId);

  // Fetch filters data
  const { data: categories } = useExpenseCategoryList();
  const { data: budgets } = useBudgetList();

  const { data, isLoading, refetch } = useQuery(
    trpc.expense.listExpenses.queryOptions({
      limit,
      offset,
      categoryId: selectedCategory === "all" ? undefined : selectedCategory,
      budgetId: selectedBudget === "all" ? undefined : selectedBudget,
      sortBy,
      sortOrder,
      // search, // Assuming the API supports search, if not we might need to filter client side or add it to API
    }),
  );

  const { data: analyticsData } = useQuery(
    trpc.expense.getAnalytics.queryOptions({})
  );

  const deleteMutation = useMutation(
    trpc.expense.deleteExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense deleted successfully!");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense");
      },
    }),
  );

  const handleDelete = (expenseId: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate({ expenseId });
    }
  };

  const expenses = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.totalItems / meta.limit) : 0;
  const currentPage = meta ? Math.floor(meta.offset / meta.limit) + 1 : 1;

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Map expenses to Transaction interface
  const transactions: Transaction[] = expenses.map((expense: any) => ({
    id: expense.id,
    amount: Number(expense.expenseAmount),
    date: expense.date,
    description: expense.description,
    category: expense.category,
    budget: expense.budget,
    name: expense.name,
    type: "expense",
  }));

  // Filter options
  const categoryOptions = categories?.map((c) => ({ label: c.name, value: c.id })) || [];
  const budgetOptions = budgets?.map((b) => ({ label: b.name, value: b.id })) || [];

  return (
    <div className="space-y-6">
      {/* Analytics Section */}
      {analyticsData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Summary Cards */}
          <div className="col-span-7 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData.totalSpending)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recurring Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData.totalRecurring)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total recurring costs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.categoryBreakdown[0]?.name || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(
                    analyticsData.categoryBreakdown[0]?.amount || 0
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
              <CardDescription>Expense breakdown by month</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                config={{
                  amount: {
                    label: "Spending",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={analyticsData.monthlyBreakdown}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="amount"
                    fill="var(--color-amount)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Distribution of expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={Object.fromEntries(
                  analyticsData.categoryBreakdown
                    .slice(0, 6)
                    .map((item, index) => [
                      item.name,
                      { label: item.name, color: COLORS[index % COLORS.length] },
                    ])
                )}
                className="h-[300px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={analyticsData.categoryBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {analyticsData.categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Manage and track your expenses</CardDescription>
          </div>
          <Button onClick={() => router.push("/expenses/create")}>
            + Add Expense
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            onCategoryChange={(val) => {
                setSelectedCategory(val);
                setOffset(0);
            }}
            budgets={budgetOptions}
            selectedBudget={selectedBudget}
            onBudgetChange={(val) => {
                setSelectedBudget(val);
                setOffset(0);
            }}
            onClearFilters={() => {
                setSearch("");
                setSelectedCategory(undefined);
                setSelectedBudget(undefined);
                setOffset(0);
            }}
          />

          <TransactionTable
            data={transactions}
            isLoading={isLoading}
            pageCount={totalPages}
            currentPage={currentPage}
            onPageChange={(page) => setOffset((page - 1) * limit)}
            onSortChange={(field, order) => {
                setSortBy(field as any);
                setSortOrder(order);
            }}
            sortField={sortBy}
            sortOrder={sortOrder}
            onDelete={handleDelete}
            onEdit={(id) => router.push(`/expenses/${id}/edit`)}
            onView={(id) => router.push(`/expenses/${id}`)}
            type="expense"
          />
        </CardContent>
      </Card>
    </div>
  );
}
