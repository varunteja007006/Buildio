"use client";

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
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { cn } from "@workspace/ui/lib/utils";
import { Eye, Loader2, RotateCcw, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import * as React from "react";

import { TransactionDeleteDialog } from "@/components/organisms/transaction/transaction-delete-dialog";
import { TransactionReviewDialog, type ReviewTransaction } from "@/components/organisms/transaction/transaction-review-dialog";
import {
  useBankAccountList,
  useExpenseCategoryList,
  usePaymentMethodList,
  useStatementList,
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

  const [reviewing, setReviewing] = React.useState<ReviewTransaction | null>(null);

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
  const { data: categoriesData } = useExpenseCategoryList({ limit: 200, page: 1 });
  const { data: paymentMethods } = usePaymentMethodList();
  const { data: bankAccounts } = useBankAccountList();

  const transactions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.currentPage ?? 1;

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

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Review transactions extracted from your statements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search merchant, description, ref..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Statement</Label>
              <Select
                value={statementUploadId}
                onValueChange={(value) => {
                  setStatementUploadId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All statements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statements</SelectItem>
                  {statementsData?.data.map((statement) => (
                    <SelectItem key={statement.id} value={statement.id}>
                      {statement.originalFilename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Account</Label>
              <Select
                value={bankAccountId}
                onValueChange={(value) => {
                  setBankAccountId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
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
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={transactionType}
                onValueChange={(value) => {
                  setTransactionType(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {(Object.keys(transactionTypeLabels) as TransactionType[]).map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {transactionTypeLabels[type]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Direction</Label>
              <Select
                value={direction}
                onValueChange={(value) => {
                  setDirection(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Both" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Both</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  setCategoryId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40">
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

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Payment</Label>
              <Select
                value={paymentMethodId}
                onValueChange={(value) => {
                  setPaymentMethodId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
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

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                className="w-40"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                className="w-40"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2 pb-2">
              <Checkbox
                id="needs-review"
                checked={markForReviewOnly}
                onCheckedChange={(checked) => {
                  setMarkForReviewOnly(Boolean(checked));
                  setPage(1);
                }}
              />
              <Label htmlFor="needs-review" className="whitespace-nowrap">
                Needs review only
              </Label>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
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
                      colSpan={9}
                      className="py-8 text-center text-muted-foreground"
                    >
                      <Loader2 className="mx-auto size-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
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
                        onClick={() => setReviewing(transaction)}
                      >
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
                            {transactionTypeLabels[transaction.transactionType] ??
                              transaction.transactionType}
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
                            <Badge
                              variant="secondary"
                              className="font-normal"
                            >
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
                                setReviewing(transaction);
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

      <TransactionReviewDialog
        transaction={reviewing}
        open={Boolean(reviewing)}
        onOpenChange={(open) => {
          if (!open) setReviewing(null);
        }}
      />
    </div>
  );
}
