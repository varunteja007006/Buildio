"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit2, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { useTRPC } from "@/lib/trpc-client";

import {
  ExpenseCategoryDelete,
  ExpenseCategoryDetailsDialog,
  ExpenseCategoryFormDialog,
} from ".";

export function ExpenseCategoryListComponent() {
  const router = useRouter();
  const trpc = useTRPC();

  const [limit, setLimit] = React.useState(10);
  const [page, setPage] = React.useState(1);

  const { data, isLoading, refetch } = useQuery(
    trpc.expenseCategory.listCategories.queryOptions({
      limit,
      page,
    }),
  );

  const categories = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.currentPage ?? 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>
          Manage your expense category classifications
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

            <ExpenseCategoryFormDialog mode="create" />
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
                      Loading expense categories...
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No expense categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category: any) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.description || "-"}</TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ExpenseCategoryDetailsDialog
                            categoryId={category.id}
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/expense-categories/${category.id}/edit`,
                              )
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <ExpenseCategoryDelete categoryId={category.id} />
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
                {meta.totalItems} categories
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
  );
}
