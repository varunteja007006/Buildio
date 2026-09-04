"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIncomeSavings } from "@/hooks";

import {
  CardSkeleton,
  chartTheme,
  currencyTooltip,
  EmptyState,
  formatCompactCurrency,
  Stat,
} from "./shared";

export function SavingsRateCard() {
  const { data, isLoading } = useIncomeSavings();
  const monthly = data?.monthly ?? [];
  const latest = monthly[monthly.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4" /> Income & savings rate
        </CardTitle>
        <CardDescription>Monthly income vs expense</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : monthly.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No income or expense data yet"
            description="Extract statements and record income to see your monthly savings rate."
          />
        ) : (
          <div className="space-y-4">
            {latest && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                  icon={ArrowUpCircle}
                  label={`Income (${latest.month})`}
                  value={formatCurrency(latest.income)}
                  tone="positive"
                />
                <Stat
                  icon={ArrowDownCircle}
                  label={`Expenses (${latest.month})`}
                  value={formatCurrency(latest.expense)}
                  tone="negative"
                />
                <Stat
                  icon={PiggyBank}
                  label="Savings rate"
                  value={`${(latest.savingsRate * 100).toFixed(0)}%`}
                  tone={latest.savingsRate >= 0 ? "positive" : "negative"}
                />
              </div>
            )}
            <ChartContainer config={chartTheme} className="h-48 w-full">
              <BarChart data={monthly} margin={{ top: 4 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={formatCompactCurrency}
                />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={currencyTooltip} />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
