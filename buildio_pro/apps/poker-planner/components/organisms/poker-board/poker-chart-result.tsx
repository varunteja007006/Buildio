import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

const chartConfig = {
  value: {
    label: "Votes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function PokerResultChart({
  chartData,
}: Readonly<{
  chartData: {
    name: string;
    value: number;
  }[];
}>) {
  return (
    <ChartContainer className="h-[240px] w-fit mx-auto" config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              coordinate={{
                x: 0,
                y: 0,
              }}
              payload={chartData}
              accessibilityLayer
              active
              hideLabel
            />
          }
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={8} />
      </BarChart>
    </ChartContainer>
  );
}
