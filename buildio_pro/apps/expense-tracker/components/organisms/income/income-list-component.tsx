"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Eye } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
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

interface IncomeListComponentProps {
  sourceId?: string;
}

export function IncomeListComponent({ sourceId }: IncomeListComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const [limit, setLimit] = React.useState(10);
  const [offset, setOffset] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading, refetch } = useQuery(
    trpc.income.listIncomes.queryOptions({
      limit,
      offset,
      sourceId,
      sortBy,
      sortOrder,
    }),
  );

  const { data: analyticsData } = useQuery(
    trpc.income.getAnalytics.queryOptions({}),
  );

  const deleteMutation = useMutation(
    trpc.income.deleteIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income deleted successfully!");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income");
      },
    }),
  );

  const handleDelete = (incomeId: string) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      deleteMutation.mutate({ incomeId });
    }
  };

  const incomes = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.totalItems / meta.limit) : 0;
  const currentPage = meta ? Math.floor(meta.offset / meta.limit) + 1 : 1;

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

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
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analyticsData.totalIncome)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${analyticsData.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(analyticsData.netIncome)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Income - Expenses
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.sourceBreakdown[0]?.source || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(
                    analyticsData.sourceBreakdown[0]?.amount || 0,
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Monthly Income</CardTitle>
              <CardDescription>Income breakdown by month</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                config={{
                  amount: {
                    label: "Income",
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

          {/* Source Breakdown Chart */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Income by Source</CardTitle>
              <CardDescription>Distribution of income sources</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={Object.fromEntries(
                  analyticsData.sourceBreakdown.map((item, index) => [
                    item.source,
                    {
                      label: item.source,
                      color: COLORS[index % COLORS.length],
                    },
                  ]),
                )}
                className="h-[300px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={analyticsData.sourceBreakdown}
                    dataKey="amount"
                    nameKey="source"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {analyticsData.sourceBreakdown.map((entry, index) => (
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
        <CardHeader>
          <CardTitle>Income</CardTitle>
          <CardDescription>Manage and track your income</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setOffset(0);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(val: any) => setSortBy(val)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">By Date</SelectItem>
                    <SelectItem value="amount">By Amount</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(val: any) => setSortOrder(val)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => router.push("/income/create")}>
                + Add Income
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading income...
                      </TableCell>
                    </TableRow>
                  ) : incomes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No income found
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomes.map((income: any) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">
                          {income.name || "-"}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          ${Number(income.incomeAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>{income.source?.name || "-"}</TableCell>
                        <TableCell>
                          {income.paymentMethod?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(income.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/income/${income.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/income/${income.id}/edit`)
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(income.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {offset + 1} to{" "}
                  {Math.min(offset + limit, meta.totalItems)} of{" "}
                  {meta.totalItems} income entries
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={!meta.hasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
