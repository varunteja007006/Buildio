"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  MoreHorizontal,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Tag,
  Trash2,
  Edit2,
  Eye,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { format } from "date-fns";
import { getCategoryIcon, getCategoryColor } from "@/lib/category-icons";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2 } from "lucide-react";

export interface Transaction {
  id: string;
  amount: number;
  date: Date | string;
  description?: string;
  category?: { name: string; id: string };
  budget?: { name: string; id: string };
  name: string;
  type?: "income" | "expense"; // Optional if we infer from context
}

interface TransactionTableProps {
  data: Transaction[];
  isLoading: boolean;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  type?: "income" | "expense";
}

export function TransactionTable({
  data,
  isLoading,
  pageCount,
  currentPage,
  onPageChange,
  onSortChange,
  sortField,
  sortOrder,
  onDelete,
  onEdit,
  onView,
  type = "expense",
}: TransactionTableProps) {
  const handleSort = (field: string) => {
    if (!onSortChange) return;
    const newOrder =
      field === sortField && sortOrder === "desc" ? "asc" : "desc";
    onSortChange(field, newOrder);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortField === "name" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-2">
                  Date
                  {sortField === "date" && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="text-right cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end gap-2">
                  Amount
                  {sortField === "amount" && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((transaction) => {
                const Icon = getCategoryIcon(transaction.category?.name);
                const colorClass = getCategoryColor(transaction.category?.name);
                const isIncome = type === "income";

                return (
                  <TableRow key={transaction.id} className="group">
                    <TableCell>
                      <div
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center",
                          colorClass,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.name}</div>
                      {transaction.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {transaction.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {format(new Date(transaction.date), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "h:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.category ? (
                        <Badge variant="secondary" className="font-normal">
                          {transaction.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          isIncome ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onView(transaction.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEdit(transaction.id)}
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(transaction.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {pageCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= pageCount}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
