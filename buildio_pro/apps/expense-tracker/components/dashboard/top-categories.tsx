"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";

interface CategoryData {
  name: string;
  totalSpent: number;
  count: number;
}

interface TopCategoriesProps {
  data: CategoryData[];
  isLoading?: boolean;
  className?: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

export function TopCategories({
  data,
  isLoading,
  className,
}: TopCategoriesProps) {
  // Filter out categories with 0 spent to avoid empty segments
  const activeData = data.filter((d) => d.totalSpent > 0);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Top Categories</CardTitle>
        <CardDescription>Expense distribution by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activeData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="totalSpent"
                >
                  {activeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold">{activeData.length}</div>
                <div className="text-xs text-muted-foreground">Categories</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <div className="p-6 pt-0">
        <div className="grid grid-cols-2 gap-2 mt-4">
          {activeData.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate flex-1">{item.name}</span>
              <span className="font-medium">
                {formatCurrency(item.totalSpent)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
