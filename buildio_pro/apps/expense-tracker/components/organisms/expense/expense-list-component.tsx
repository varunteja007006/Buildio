"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit2, Eye } from "lucide-react";

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

import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface ExpenseListComponentProps {
  categoryId?: string;
  budgetId?: string;
}

export function ExpenseListComponent({
  categoryId,
  budgetId,
}: ExpenseListComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const [limit, setLimit] = React.useState(10);
  const [offset, setOffset] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading, refetch } = useQuery(
    trpc.expense.listExpenses.queryOptions({
      limit,
      offset,
      categoryId,
      budgetId,
      sortBy,
      sortOrder,
    }),
  );

  const deleteMutation = useMutation(
    trpc.expense.deleteExpense.mutationOptions({
      onSuccess: () => {
        toast.success("Expense deleted successfully!");
        refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense");
      },
    }),
  );

  const handleDelete = (expenseId: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate({ expenseId });
    }
  };

  const expenses = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.totalItems / meta.limit) : 0;
  const currentPage = meta ? Math.floor(meta.offset / meta.limit) + 1 : 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>Manage and track your expenses</CardDescription>
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

            <Button onClick={() => router.push("/expenses/create")}>
              + Add Expense
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Recurring</TableHead>
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
                      Loading expenses...
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {expense.name}
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(expense.expenseAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>{expense.category?.name || "-"}</TableCell>
                      <TableCell>{expense.account || "-"}</TableCell>
                      <TableCell>
                        {expense.isRecurring ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/expenses/${expense.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/expenses/${expense.id}/edit`)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
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
                {Math.min(offset + limit, meta.totalItems)} of {meta.totalItems}{" "}
                expenses
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
  );
}
