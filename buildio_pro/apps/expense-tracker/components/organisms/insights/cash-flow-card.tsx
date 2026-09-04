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
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowDownCircle,
  Clock,
  Landmark,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useCashFlow } from "@/hooks";

import {
  CardSkeleton,
  chartTheme,
  currencyTooltip,
  EmptyState,
  formatCompactCurrency,
  runwayTone,
  Stat,
} from "./shared";

export function CashFlowCard() {
  const { data, isLoading } = useCashFlow();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-4" /> Cash flow per account
        </CardTitle>
        <CardDescription>
          Monthly inflow/outflow, runway and deficit months
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CardSkeleton />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No account data yet"
            description="Upload and extract a bank statement to see cash flow, runway and deficit months."
          />
        ) : (
          <div className="space-y-6">
            {data.map((account) => (
              <div
                key={account.bankAccountId}
                className="space-y-4 rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {account.accountName ?? "Account"}
                  </p>
                  {account.runwayMonths !== null && (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        runwayTone(account.runwayMonths),
                      )}
                    >
                      {account.runwayMonths.toFixed(1)} mo runway
                    </span>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat
                    icon={Wallet}
                    label="Current balance"
                    value={
                      account.currentBalance !== null
                        ? formatCurrency(account.currentBalance)
                        : "-"
                    }
                  />
                  <Stat
                    icon={ArrowDownCircle}
                    label="Avg monthly burn"
                    value={formatCurrency(account.avgMonthlyBurn)}
                    tone="negative"
                  />
                  <Stat
                    icon={Clock}
                    label="Runway"
                    value={
                      account.runwayMonths !== null
                        ? `${account.runwayMonths.toFixed(1)} mo`
                        : "-"
                    }
                    tone={
                      account.runwayMonths !== null && account.runwayMonths < 3
                        ? "warning"
                        : "default"
                    }
                  />
                  <Stat
                    icon={ShieldAlert}
                    label="Deficit months"
                    value={String(account.deficitMonths)}
                    tone={account.deficitMonths > 0 ? "negative" : "default"}
                  />
                </div>

                <ChartContainer config={chartTheme} className="h-48 w-full">
                  <BarChart data={account.months} margin={{ top: 4 }}>
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
                      dataKey="debit"
                      fill="var(--color-debit)"
                      radius={4}
                    />
                    <Bar
                      dataKey="credit"
                      fill="var(--color-credit)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
