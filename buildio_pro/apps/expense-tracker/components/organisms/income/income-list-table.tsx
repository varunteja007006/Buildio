import React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
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

import { Trash2, Edit2, Eye } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc-client";

import { useQuery, useMutation } from "@tanstack/react-query";

export const IncomeListTable = () => {
  const router = useRouter();
  const trpc = useTRPC();

  const [limit, setLimit] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading, refetch } = useQuery(
    trpc.income.listIncomes.queryOptions({
      limit,
      page,
    }),
  );

  const deleteMutation = useMutation(
    trpc.income.deleteIncome.mutationOptions({
      onSuccess: () => {
        toast.success("Income deleted successfully!");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income");
      },
    }),
  );

  const handleDelete = (incomeId: string) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      deleteMutation.mutate({ incomeId });
    }
  };

  const incomes = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.currentPage ?? 1;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Income</CardTitle>
          <CardDescription>Manage and track your income</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setPage(1);
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

                <Select
                  value={sortBy}
                  onValueChange={(val: any) => setSortBy(val)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">By Date</SelectItem>
                    <SelectItem value="amount">By Amount</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(val: any) => setSortOrder(val)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => router.push("/income/create")}>
                + Add Income
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading income...
                      </TableCell>
                    </TableRow>
                  ) : incomes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No income found
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomes.map((income: any) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium">
                          {income.name || "-"}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          ${Number(income.incomeAmount).toFixed(2)}
                        </TableCell>
                        <TableCell>{income.source?.name || "-"}</TableCell>
                        <TableCell>
                          {income.paymentMethod?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(income.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/income/${income.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/income/${income.id}/edit`)
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(income.id)}
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
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, meta.totalItems)} of{" "}
                  {meta.totalItems} income entries
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!meta.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
