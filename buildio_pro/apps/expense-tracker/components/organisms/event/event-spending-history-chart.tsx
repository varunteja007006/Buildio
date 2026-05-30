import React from "react";

import { BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

import { useEventSpendingHistory } from "@/hooks";

export function EventSpendingHistoryChart({ eventId }: { eventId: string }) {
  const { data: history } = useEventSpendingHistory(eventId);

  return (
    <div className="space-y-6">
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending History</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Amount",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={history}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <BarChart dataKey="amount" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
