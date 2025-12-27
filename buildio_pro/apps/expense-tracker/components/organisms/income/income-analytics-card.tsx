import React from "react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@workspace/ui/components/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

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

import { formatCurrency } from "@workspace/ui/lib/currency.utils";

import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const IncomeAnalyticsCard = () => {
  const trpc = useTRPC();

  const { data: analyticsData } = useQuery(
    trpc.income.getAnalytics.queryOptions(),
  );

  return (
    <div>
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
    </div>
  );
};
