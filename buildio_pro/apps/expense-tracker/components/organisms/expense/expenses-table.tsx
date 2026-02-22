import React from "react";

import { ColumnDef, Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { useQueryState } from "nuqs";

import { ActionBar } from "@workspace/ui/components/action-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { CardDescription, CardTitle } from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@workspace/ui/components/data-table/data-table-advanced-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";

import { ErrorScreen } from "@/components/atoms/error-screen";
import { FloatingLoader } from "@/components/atoms/loaders/floating-loader";
import { FilterBar } from "@/components/transactions/filter-bar";
import { useExpenseList } from "@/hooks";
import { useBudgetList, useExpenseCategoryList } from "@/hooks";
import { useDeleteExpenses } from "@/hooks";

import {
  ExpenseDeleteDialog,
  ExpenseDetailsComponent,
  ExpenseFormComponent,
} from ".";

type ExpenseRecord = {
  id: string;
  name: string;
  date: Date;
  amount: number;
  category?: { name: string; id: string };
  budget?: { name: string; id: string };
  isRecurring: boolean;
};

const columns: ColumnDef<ExpenseRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 32,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "amount", header: "Amount" },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return row.original.category?.name || "-";
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      return row.original.budget?.name || "-";
    },
  },
  {
    accessorKey: "date",
    header: "Transaction Date",
    cell: ({ row }) => {
      const val = row.original.date;
      return new Date(val).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const expense = row.original;

      return (
        <div className="flex justify-start gap-2">
          <ExpenseDetailsComponent expenseId={expense.id} />
          <ExpenseFormComponent
            mode="edit"
            initialValues={{
              name: expense.name,
              expenseAmount: expense.amount.toString(),
              categoryId: expense.category?.id,
              budgetId: expense.budget?.id,
              isRecurring: expense.isRecurring,
            }}
            expenseId={expense.id}
          />
          <ExpenseDeleteDialog expenseId={expense.id} />
        </div>
      );
    },
    enableSorting: false,
  },
];

export const ExpenseListTable = () => {
  const [sortBy, setSortBy] = React.useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  // Filter states
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<
    string | undefined
  >(undefined);
  const [selectedBudget, setSelectedBudget] = React.useState<
    string | undefined
  >(undefined);

  const [limit] = useQueryState("perPage", {
    defaultValue: 10,
    parse: (v) => parseInt(v, 10),
  });

  const [page, setPage] = useQueryState("page", {
    defaultValue: 1,
    parse: (v) => parseInt(v, 10),
  });

  const { data, isLoading, isError } = useExpenseList({
    limit,
    page,
    categoryId: selectedCategory === "all" ? undefined : selectedCategory,
    budgetId: selectedBudget === "all" ? undefined : selectedBudget,
    sortBy,
    sortOrder,
  });

  const expenses = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.currentPage ?? 1;

  // Map expenses to Transaction interface
  const transactions: ExpenseRecord[] = expenses.map((expense) => ({
    id: expense.id,
    name: expense.name,
    date: expense.createdAt,
    amount: Number(expense.expenseAmount),
    category: expense.category
      ? { id: expense.category.id, name: expense.category.name }
      : undefined,
    budget: expense.budget
      ? { id: expense.budget.id, name: expense.budget.name }
      : undefined,
    isRecurring: expense.isRecurring ?? false,
  }));

  const { table } = useDataTable({
    data: transactions,
    columns,
    pageCount: totalPages,
  });

  // Fetch filters data
  const { data: categories } = useExpenseCategoryList({ limit: 100, page: 1 });
  const { data: budgets } = useBudgetList({ limit: 100, page: 1 });

  // Filter options
  const categoryOptions =
    categories?.data?.map((c) => ({ label: c.name, value: c.id })) || [];
  const budgetOptions =
    budgets?.data?.map((b) => ({ label: b.name, value: b.id })) || [];
  if (isError) {
    return <ErrorScreen />;
  }

  return (
    <>
      <div className="space-y-1">
        <CardTitle>Expenses</CardTitle>
        <CardDescription>Manage and track your expenses</CardDescription>
      </div>
      <DataTable table={table} actionBar={<TableActionBar table={table} />}>
        <DataTableAdvancedToolbar table={table}>
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            onCategoryChange={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
            budgets={budgetOptions}
            selectedBudget={selectedBudget}
            onBudgetChange={(val) => {
              setSelectedBudget(val);
              setPage(1);
            }}
            onClearFilters={() => {
              setSearch("");
              setSelectedCategory(undefined);
              setSelectedBudget(undefined);
              setPage(1);
            }}
          />
        </DataTableAdvancedToolbar>
      </DataTable>
      <FloatingLoader open={isLoading} title="Loading income records..." />
    </>
  );
};

function TableActionBar({ table }: { table: Table<ExpenseRecord> }) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false);
      }
    },
    [table],
  );

  const deleteExpenses = useDeleteExpenses({
    onSuccess: () => {
      table.toggleAllRowsSelected(false);
    },
  });

  return (
    <ActionBar open={rows.length > 0} onOpenChange={onOpenChange}>
      {/* Add your custom actions here */}
      <p className="text-sm">Delete {rows.length} selected items</p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={rows.length === 0}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteExpenses.mutate({
                    expenseIds: rows.map((item) => item.original.id),
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {rows.length} items
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ActionBar>
  );
}
