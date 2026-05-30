import React from "react";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
} from "@workspace/ui/components/chart";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";

import { SimpleCard } from "@/components/atoms/card";
import { useIncomeSourceAnalytics } from "@/hooks";

export const IncomeSourceAnalyticsCard = () => {
  const { data: analyticsData } = useIncomeSourceAnalytics();

  const totalSources = analyticsData?.length || 0;
  const topSource = analyticsData?.reduce(
    (prev, current) => {
      if (current.totalEarned > prev.totalAmount) {
        return {
          sourceName: current.name,
          totalAmount: current.totalEarned,
        };
      }
      return prev;
    },
    {
      sourceName: "N/A",
      totalAmount: 0,
    },
  ) ?? {
    sourceName: "N/A",
    totalAmount: 0,
  };

  const totalEarned =
    analyticsData?.reduce((sum, item) => sum + item.totalEarned, 0) || 0;

  return (
    <>
      {/* Analytics Section */}
      {analyticsData && analyticsData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Income Distribution</CardTitle>
              <CardDescription>Total income per source</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                config={{
                  totalEarned: {
                    label: "Total Earned",
                    color: "var(--chart-1)",
                  },
                }}
                className="h-[300px] w-full"
              >
                <BarChart accessibilityLayer data={analyticsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="totalEarned"
                    fill="var(--color-totalEarned)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="col-span-3 space-y-4">
            <SimpleCard
              title="Total Sources"
              content={<div className="text-2xl font-bold">{totalSources}</div>}
            />
            <SimpleCard
              title="Top Income Source"
              content={
                <>
                  <div className="text-2xl font-bold">
                    {topSource.sourceName}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(topSource.totalAmount)} earned
                  </p>
                </>
              }
            />
            <SimpleCard
              title="Total Earned"
              content={
                <div className="text-2xl font-bold">
                  {formatCurrency(totalEarned)}
                </div>
              }
            />
          </div>
        </div>
      )}
    </>
  );
};
