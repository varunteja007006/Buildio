"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Eye } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
} from "@workspace/ui/components/chart";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";

import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

export function IncomeSourceListComponent() {
  const router = useRouter();
  const trpc = useTRPC();

  const [limit, setLimit] = React.useState(10);
  const [offset, setOffset] = React.useState(0);

  const { data, isLoading, refetch } = useQuery(
    trpc.incomeSource.listSources.queryOptions({
      limit,
      offset,
    }),
  );

  const { data: analyticsData } = useQuery(
    trpc.incomeSource.getAnalytics.queryOptions({}),
  );

  const deleteMutation = useMutation(
    trpc.incomeSource.deleteSource.mutationOptions({
      onSuccess: () => {
        toast.success("Income source deleted successfully!");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income source");
      },
    }),
  );

  const handleDelete = (sourceId: string) => {
    if (window.confirm("Are you sure you want to delete this income source?")) {
      deleteMutation.mutate({ sourceId });
    }
  };

  const sources = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.totalItems / meta.limit) : 0;
  const currentPage = meta ? Math.floor(meta.offset / meta.limit) + 1 : 1;

  const totalSources = analyticsData?.length || 0;
  const topSource = analyticsData?.reduce(
    (prev, current) =>
      prev.totalAmount > current.totalAmount ? prev : current,
    analyticsData[0] || { sourceName: "N/A", totalAmount: 0 },
  );
  const totalEarned =
    analyticsData?.reduce((sum, item) => sum + item.totalAmount, 0) || 0;

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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>
            Manage your income source categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
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

              <Button onClick={() => router.push("/income-sources/create")}>
                + Add Income Source
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading income sources...
                      </TableCell>
                    </TableRow>
                  ) : sources.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No income sources found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sources.map((source: any) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-medium">
                          {source.name}
                        </TableCell>
                        <TableCell>{source.description || "-"}</TableCell>
                        <TableCell>
                          {new Date(source.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/income-sources/${source.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/income-sources/${source.id}/edit`)
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(source.id)}
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
                  {meta.totalItems} sources
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
