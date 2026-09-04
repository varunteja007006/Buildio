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
import { PiggyBank, Receipt, TrendingDown, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useCommitments } from "@/hooks";

import {
  CardSkeleton,
  chartTheme,
  currencyTooltip,
  EmptyState,
  formatCompactCurrency,
  Stat,
} from "./shared";

export function CommitmentsCard() {
  const { data, isLoading } = useCommitments();
  const latest = data?.[data.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed vs discretionary</CardTitle>
        <CardDescription>
          Committed outflow (EMIs, recurring, insurance)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No spend data yet"
            description="Extract statements to break down spending into committed and discretionary."
          />
        ) : (
          <div className="space-y-4">
            {latest && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                  icon={PiggyBank}
                  label={`Committed (${latest.month})`}
                  value={formatCurrency(latest.committed)}
                />
                <Stat
                  icon={Wallet}
                  label={`Discretionary (${latest.month})`}
                  value={formatCurrency(latest.discretionary)}
                />
                <Stat
                  icon={TrendingDown}
                  label="Committed ratio"
                  value={`${(latest.committedRatio * 100).toFixed(0)}%`}
                  tone={latest.committedRatio > 0.5 ? "warning" : "default"}
                />
              </div>
            )}
            {data.length > 1 && (
              <ChartContainer config={chartTheme} className="h-40 w-full">
                <BarChart data={data} margin={{ top: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={48}
                    tickFormatter={formatCompactCurrency}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={currencyTooltip} />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="committed"
                    stackId="a"
                    fill="var(--color-committed)"
                    radius={0}
                  />
                  <Bar
                    dataKey="discretionary"
                    stackId="a"
                    fill="var(--color-discretionary)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
