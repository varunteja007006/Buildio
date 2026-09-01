"use client";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@workspace/ui/components/action-bar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";
import { Toggle } from "@workspace/ui/components/toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  CircleAlert,
  Eye,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { SearchInput } from "@/components/atoms/search-input";
import { TransactionDeleteDialog } from "@/components/organisms/transaction/transaction-delete-dialog";
import {
  TransactionReviewDialog,
  type ReviewTransaction,
} from "@/components/organisms/transaction/transaction-review-dialog";
import {
  useBankAccountList,
  useExpenseCategoryList,
  usePaymentMethodList,
  useStatementList,
  useTransactionBulkDelete,
  useTransactionList,
  type TransactionDirection,
  type TransactionType,
} from "@/hooks";

const transactionTypeLabels: Record<TransactionType, string> = {
  expense: "Expense",
  income: "Income",
  transfer: "Transfer",
  investment: "Investment",
  loan_payment: "Loan Payment",
  insurance: "Insurance",
  refund: "Refund",
  interest: "Interest",
  fee: "Fee",
  cash_withdrawal: "Cash Withdrawal",
  round_up: "Round-up",
  unknown: "Unknown",
};

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TransactionsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-16 text-center text-muted-foreground">
          Loading transactions...
        </div>
      }
    >
      <TransactionsPageContent />
    </React.Suspense>
  );
}

function TransactionsPageContent() {
  const searchParams = useSearchParams();

  const [statementUploadId, setStatementUploadId] = React.useState<string>(
    searchParams.get("statementUploadId") ?? "",
  );
  const [bankAccountId, setBankAccountId] = React.useState<string>("");
  const [categoryId, setCategoryId] = React.useState("");
  const [paymentMethodId, setPaymentMethodId] = React.useState("");
  const [transactionType, setTransactionType] = React.useState("");
  const [direction, setDirection] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [markForReviewOnly, setMarkForReviewOnly] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [limit, setLimit] = React.useState(20);
  const [page, setPage] = React.useState(1);

  const [reviewing, setReviewing] = React.useState<ReviewTransaction | null>(
    null,
  );

  // When the review dialog is dismissed by clicking outside, the modal overlay
  // closes it on `pointerdown`, but the resulting `click` can land on the row
  // underneath (the overlay unmounts before `pointerup`), re-triggering
  // `setReviewing` and instantly reopening the dialog. Swallow those clicks.
  const lastReviewDialogClosedAtRef = React.useRef(0);

  const openReviewDialog = React.useCallback(
    (transaction: ReviewTransaction) => {
      if (Date.now() - lastReviewDialogClosedAtRef.current < 400) return;
      setReviewing(transaction);
    },
    [],
  );

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const bulkDelete = useTransactionBulkDelete({
    onSuccess: () => {
      setBulkDeleteOpen(false);
      setSelectedIds(new Set());
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = transactions.map((transaction) => transaction.id);
    const allSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const filterKey = [
    statementUploadId,
    bankAccountId,
    categoryId,
    paymentMethodId,
    transactionType,
    direction,
    search,
    markForReviewOnly,
    startDate,
    endDate,
  ].join("|");

  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [filterKey]);

  const { data, isLoading } = useTransactionList({
    limit,
    page,
    bankAccountId: bankAccountId || undefined,
    statementUploadId: statementUploadId || undefined,
    categoryId: categoryId || undefined,
    paymentMethodId: paymentMethodId || undefined,
    transactionType: (transactionType as TransactionType) || undefined,
    direction: (direction as TransactionDirection) || undefined,
    search: search || undefined,
    startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
    endDate: endDate ? new Date(`${endDate}T23:59:59`) : undefined,
    markForReviewOnly,
  });

  const { data: statementsData } = useStatementList({ limit: 100, page: 1 });
  const { data: categoriesData } = useExpenseCategoryList({
    limit: 200,
    page: 1,
  });
  const { data: paymentMethods } = usePaymentMethodList();
  const { data: bankAccounts } = useBankAccountList();

  const transactions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.currentPage ?? 1;

  const pageSelectedCount = transactions.filter((transaction) =>
    selectedIds.has(transaction.id),
  ).length;
  const selectAllChecked: boolean | "indeterminate" =
    transactions.length === 0
      ? false
      : pageSelectedCount === transactions.length
        ? true
        : pageSelectedCount > 0
          ? "indeterminate"
          : false;

  const hasActiveFilters =
    statementUploadId ||
    bankAccountId ||
    categoryId ||
    paymentMethodId ||
    transactionType ||
    direction ||
    search ||
    markForReviewOnly ||
    startDate ||
    endDate;

  const resetFilters = () => {
    setStatementUploadId("");
    setBankAccountId("");
    setCategoryId("");
    setPaymentMethodId("");
    setTransactionType("");
    setDirection("");
    setSearch("");
    setMarkForReviewOnly(false);
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
  };

  const selectedStatement = statementsData?.data.find(
    (statement) => statement.id === statementUploadId,
  );
  const selectedAccount = bankAccounts?.find(
    (account) => account.id === bankAccountId,
  );
  const selectedCategory = categoriesData?.data.find(
    (category) => category.id === categoryId,
  );
  const selectedPaymentMethod = paymentMethods?.find(
    (method) => method.id === paymentMethodId,
  );

  const activeFilterChips = [
    search && {
      key: "search",
      label: search.length > 24 ? `${search.slice(0, 24)}…` : search,
      onRemove: () => setSearch(""),
    },
    statementUploadId && {
      key: "statement",
      label: selectedStatement?.originalFilename ?? "Statement",
      onRemove: () => setStatementUploadId(""),
    },
    bankAccountId && {
      key: "account",
      label: selectedAccount
        ? `${selectedAccount.bankName}${selectedAccount.lastFour ? ` ••${selectedAccount.lastFour}` : ""}`
        : "Account",
      onRemove: () => setBankAccountId(""),
    },
    transactionType && {
      key: "type",
      label: transactionTypeLabels[transactionType as TransactionType],
      onRemove: () => setTransactionType(""),
    },
    direction && {
      key: "direction",
      label: direction === "debit" ? "Debit" : "Credit",
      onRemove: () => setDirection(""),
    },
    categoryId && {
      key: "category",
      label: selectedCategory?.name ?? "Category",
      onRemove: () => setCategoryId(""),
    },
    paymentMethodId && {
      key: "payment",
      label: selectedPaymentMethod?.name ?? "Payment",
      onRemove: () => setPaymentMethodId(""),
    },
    startDate && {
      key: "startDate",
      label: `From ${formatDate(startDate)}`,
      onRemove: () => setStartDate(""),
    },
    endDate && {
      key: "endDate",
      label: `To ${formatDate(endDate)}`,
      onRemove: () => setEndDate(""),
    },
    markForReviewOnly && {
      key: "review",
      label: "Needs review",
      onRemove: () => setMarkForReviewOnly(false),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    onRemove: () => void;
  }[];

  const advancedFilterCount = activeFilterChips.filter(
    (chip) => chip.key !== "search" && chip.key !== "direction",
  ).length;

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search merchant, description, ref..."
                className="min-w-52 flex-1"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />

              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={direction || "all"}
                onValueChange={(value) => {
                  if (!value) return;
                  setDirection(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <ToggleGroupItem value="all">All</ToggleGroupItem>
                <ToggleGroupItem
                  value="debit"
                  className="gap-1 data-[state=on]:text-red-600"
                >
                  <ArrowUpRight className="size-3.5" />
                  Debit
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="credit"
                  className="gap-1 data-[state=on]:text-green-600"
                >
                  <ArrowDownRight className="size-3.5" />
                  Credit
                </ToggleGroupItem>
              </ToggleGroup>

              <Toggle
                variant="outline"
                size="sm"
                pressed={markForReviewOnly}
                onPressedChange={(pressed) => {
                  setMarkForReviewOnly(pressed);
                  setPage(1);
                }}
                className="gap-1.5 data-[state=on]:border-amber-500/60 data-[state=on]:bg-amber-500/10 data-[state=on]:text-amber-700 dark:data-[state=on]:text-amber-400"
              >
                <CircleAlert className="size-3.5" />
                Needs review
              </Toggle>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                    {advancedFilterCount > 0 && (
                      <span className="inline-flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {advancedFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-96 p-4">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Statement
                      </Label>
                      <Select
                        value={statementUploadId}
                        onValueChange={(value) => {
                          setStatementUploadId(value);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All statements" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All statements</SelectItem>
                          {statementsData?.data.map((statement) => (
                            <SelectItem
                              key={statement.id}
                              value={statement.id}
                            >
                              {statement.originalFilename}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Account
                      </Label>
                      <Select
                        value={bankAccountId}
                        onValueChange={(value) => {
                          setBankAccountId(value);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All accounts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All accounts</SelectItem>
                          {bankAccounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bankName}
                              {account.lastFour ? ` ••${account.lastFour}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Type
                      </Label>
                      <Select
                        value={transactionType}
                        onValueChange={(value) => {
                          setTransactionType(value);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All types</SelectItem>
                          {(
                            Object.keys(
                              transactionTypeLabels,
                            ) as TransactionType[]
                          ).map((type) => (
                            <SelectItem key={type} value={type}>
                              {transactionTypeLabels[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Category
                      </Label>
                      <Select
                        value={categoryId}
                        onValueChange={(value) => {
                          setCategoryId(value);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All categories</SelectItem>
                          {categoriesData?.data.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Payment method
                      </Label>
                      <Select
                        value={paymentMethodId}
                        onValueChange={(value) => {
                          setPaymentMethodId(value);
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="All methods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All methods</SelectItem>
                          {paymentMethods?.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarRange className="size-3.5" />
                        Date range
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          className="w-full"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setPage(1);
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          to
                        </span>
                        <Input
                          type="date"
                          className="w-full"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <>
                      <div className="my-3 border-t" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={resetFilters}
                      >
                        <RotateCcw className="size-3.5" />
                        Reset all filters
                      </Button>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    className="group inline-flex max-w-64 items-center gap-1.5 rounded-full border bg-muted/50 py-0.5 pr-1.5 pl-2.5 text-xs font-medium transition-colors hover:border-destructive/40 hover:bg-destructive/10"
                    title="Remove filter"
                  >
                    <span className="truncate">{chip.label}</span>
                    <X className="size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-destructive" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="ml-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectAllChecked}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all transactions"
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Merchant / Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <Loader2 className="mx-auto size-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No transactions found. Extract a statement to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => {
                    const isCredit = transaction.direction === "credit";
                    return (
                      <TableRow
                        key={transaction.id}
                        className="cursor-pointer"
                        onClick={() => openReviewDialog(transaction)}
                      >
                        <TableCell
                          className="w-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedIds.has(transaction.id)}
                            onCheckedChange={() => toggleSelect(transaction.id)}
                            aria-label={`Select ${transaction.merchantName ?? "transaction"}`}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(transaction.transactionDate)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {transaction.merchantName ?? "-"}
                          </div>
                          {transaction.description && (
                            <div className="max-w-52 truncate text-xs text-muted-foreground">
                              {transaction.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="whitespace-nowrap text-sm">
                            {transaction.bankAccount?.name ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {transaction.category ? (
                            <Badge variant="secondary" className="font-normal">
                              {transaction.category.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {transaction.paymentMethod?.name ?? "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {transactionTypeLabels[
                              transaction.transactionType
                            ] ?? transaction.transactionType}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-medium",
                              isCredit ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {isCredit ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {transaction.needsReview ? (
                            <Badge
                              variant="destructive"
                              className="font-normal"
                            >
                              Needs review
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="font-normal">
                              Reviewed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReviewDialog(transaction);
                              }}
                            >
                              <Eye className="size-3.5" />
                              Review
                            </Button>
                            <TransactionDeleteDialog
                              transactionId={transaction.id}
                              merchantName={transaction.merchantName}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {meta && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, meta.totalItems)} of{" "}
                {meta.totalItems} transactions
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(currentPage - 1)}
                  disabled={!meta.hasPrevPage}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(currentPage + 1)}
                  disabled={!meta.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {meta && meta.totalItems > 0 && (
            <div className="mt-2 flex justify-end">
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <ActionBar
        open={selectedIds.size > 0}
        onOpenChange={(open) => {
          if (!open) setSelectedIds(new Set());
        }}
      >
        <ActionBarSelection>{selectedIds.size} selected</ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem
            variant="destructive"
            disabled={bulkDelete.isPending}
            onClick={() => setBulkDeleteOpen(true)}
          >
            {bulkDelete.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete selected
          </ActionBarItem>
        </ActionBarGroup>
        <ActionBarClose>
          <X className="size-3.5" />
        </ActionBarClose>
      </ActionBar>

      <TransactionReviewDialog
        transaction={reviewing}
        open={Boolean(reviewing)}
        onOpenChange={(open) => {
          if (!open) {
            lastReviewDialogClosedAtRef.current = Date.now();
            setReviewing(null);
          }
        }}
      />

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transactions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} transaction
              {selectedIds.size === 1 ? "" : "s"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDelete.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkDelete.isPending}
              onClick={() => {
                bulkDelete.mutate({ transactionIds: Array.from(selectedIds) });
              }}
            >
              {bulkDelete.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
