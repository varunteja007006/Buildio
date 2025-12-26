"use client";

import * as React from "react";
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

import { useIncomeSourceAnalytics, useIncomeSourceList } from "@/hooks";
import { IncomeSourceDetailsComponent } from "./income-source-details-dialog";
import { IncomeSourceFormComponent } from "./income-source-form-dialog";
import { IncomeSourceDeleteDialog } from "./income-source-delete-dialog";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<{
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "description", header: "Description" },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const val = row.original.createdAt;
      return new Date(val).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sourceId = row.original.id;
      return (
        <div className="flex justify-end gap-2">
          <IncomeSourceDetailsComponent sourceId={sourceId} />

          <IncomeSourceFormComponent
            mode="edit"
            sourceId={sourceId}
            initialValues={{
              name: row.original.name,
              description: row.original.description || "",
            }}
          />

          <IncomeSourceDeleteDialog sourceId={sourceId} />
        </div>
      );
    },
    enableSorting: false,
  },
];

export function IncomeSourceListComponent() {
  const [limit, setLimit] = React.useState(10);
  const [offset, setOffset] = React.useState(0);

  const { data, isLoading } = useIncomeSourceList({
    limit,
    offset,
  });

  const { data: analyticsData } = useIncomeSourceAnalytics();

  const sources = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.totalItems / meta.limit) : 0;
  const currentPage = meta ? Math.floor(meta.offset / meta.limit) + 1 : 1;

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
    <div className="space-y-6">
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
                  totalAmount: {
                    label: "Total Earned",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={analyticsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="sourceName"
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
                    dataKey="totalAmount"
                    fill="var(--color-totalAmount)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSources}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Income Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topSource.sourceName}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(topSource.totalAmount)} earned
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalEarned)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={sources} />
    </div>
  );
}
