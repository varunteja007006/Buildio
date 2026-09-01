"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { formatCurrency } from "@workspace/ui/lib/currency.utils";
import { Loader2 } from "lucide-react";
import * as React from "react";

import {
  useExpenseCategoryList,
  usePaymentMethodList,
  useTransactionConfirm,
  useTransactionUpdate,
  type TransactionDirection,
  type TransactionType,
} from "@/hooks";

const NO_SELECTION = "__none__";

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

export interface ReviewTransaction {
  id: string;
  transactionDate: Date | string;
  amount: number;
  direction: TransactionDirection;
  transactionType: TransactionType;
  merchantName: string | null;
  counterpartyName: string | null;
  description: string | null;
  rawDescription: string | null;
  referenceNumber: string | null;
  balanceAfter: number | null;
  isRecurring: boolean;
  isTransfer: boolean;
  extractionConfidence: number | null;
  needsReview: boolean;
  reviewedAt: Date | string | null;
  categoryId: string | null;
  paymentMethodId: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  category?: { id: string; name: string } | null;
  paymentMethod?: { id: string; name: string } | null;
  statementUpload?: { id: string; originalFilename: string } | null;
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateInputValue(value: Date | string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TransactionReviewDialog({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: ReviewTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: categoriesData } = useExpenseCategoryList({
    limit: 100,
    page: 1,
  });
  const { data: paymentMethods } = usePaymentMethodList();
  const confirmMutation = useTransactionConfirm({
    onSuccess: () => onOpenChange(false),
  });
  const updateMutation = useTransactionUpdate({
    onSuccess: () => onOpenChange(false),
  });

  const categories = categoriesData?.data ?? [];

  const [merchant, setMerchant] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [counterparty, setCounterparty] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState("");
  const [direction, setDirection] =
    React.useState<TransactionDirection>("debit");
  const [transactionType, setTransactionType] =
    React.useState<TransactionType>("unknown");
  const [categoryId, setCategoryId] = React.useState(NO_SELECTION);
  const [paymentMethodId, setPaymentMethodId] = React.useState(NO_SELECTION);
  const [referenceNumber, setReferenceNumber] = React.useState("");
  const [balanceAfter, setBalanceAfter] = React.useState("");
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [isTransfer, setIsTransfer] = React.useState(false);

  React.useEffect(() => {
    if (!transaction || !open) return;
    setMerchant(transaction.merchantName ?? "");
    setDescription(transaction.description ?? "");
    setCounterparty(transaction.counterpartyName ?? "");
    setAmount(transaction.amount ? String(transaction.amount) : "");
    setDate(toDateInputValue(transaction.transactionDate));
    setDirection(transaction.direction);
    setTransactionType(transaction.transactionType);
    setCategoryId(transaction.categoryId ?? NO_SELECTION);
    setPaymentMethodId(transaction.paymentMethodId ?? NO_SELECTION);
    setReferenceNumber(transaction.referenceNumber ?? "");
    setBalanceAfter(
      transaction.balanceAfter == null ? "" : String(transaction.balanceAfter),
    );
    setIsRecurring(transaction.isRecurring);
    setIsTransfer(transaction.isTransfer);
  }, [transaction, open]);

  const isPending = confirmMutation.isPending || updateMutation.isPending;

  const buildPayload = () => {
    const parsedAmount = amount === "" ? null : Number(amount);
    const parsedBalance = balanceAfter === "" ? null : Number(balanceAfter);
    return {
      merchantName: merchant.trim() || null,
      description: description.trim() || null,
      counterpartyName: counterparty.trim() || null,
      amount:
        parsedAmount != null && Number.isFinite(parsedAmount)
          ? parsedAmount
          : undefined,
      transactionDate: date ? new Date(`${date}T12:00:00`) : undefined,
      direction,
      transactionType,
      categoryId: categoryId === NO_SELECTION ? null : categoryId,
      paymentMethodId:
        paymentMethodId === NO_SELECTION ? null : paymentMethodId,
      referenceNumber: referenceNumber.trim() || null,
      balanceAfter:
        parsedBalance != null && Number.isFinite(parsedBalance)
          ? parsedBalance
          : null,
      isRecurring,
      isTransfer,
    };
  };

  const handleSave = () => {
    if (!transaction) return;
    updateMutation.mutate({ transactionId: transaction.id, ...buildPayload() });
  };

  const handleConfirm = () => {
    if (!transaction) return;
    confirmMutation.mutate({ transactionId: transaction.id });
  };

  const typeOptions = (
    Object.keys(transactionTypeLabels) as TransactionType[]
  ).map((value) => ({ value, label: transactionTypeLabels[value] }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review transaction</DialogTitle>
          <DialogDescription>
            {transaction?.statementUpload?.originalFilename ??
              "Extracted transaction"}
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="space-y-5">
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Raw description
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      transaction.needsReview ? "destructive" : "secondary"
                    }
                    className="font-normal"
                  >
                    {transaction.needsReview ? "Needs review" : "Reviewed"}
                  </Badge>
                  {transaction.extractionConfidence != null && (
                    <span className="text-xs text-muted-foreground">
                      confidence{" "}
                      {(transaction.extractionConfidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <p className="break-words font-mono text-sm">
                {transaction.rawDescription ?? "-"}
              </p>
              {transaction.referenceNumber && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ref: {transaction.referenceNumber}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="txn-amount">Amount</Label>
                <Input
                  id="txn-amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-date">Date</Label>
                <Input
                  id="txn-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Direction</Label>
                <Select
                  value={direction}
                  onValueChange={(value) =>
                    setDirection(value as TransactionDirection)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={(value) =>
                    setTransactionType(value as TransactionType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION}>None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select
                  value={paymentMethodId}
                  onValueChange={setPaymentMethodId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION}>None</SelectItem>
                    {paymentMethods?.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="txn-merchant">Merchant / payee</Label>
                <Input
                  id="txn-merchant"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-balance">Balance after</Label>
                <Input
                  id="txn-balance"
                  type="number"
                  step="0.01"
                  value={balanceAfter}
                  onChange={(e) => setBalanceAfter(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-counterparty">Counterparty</Label>
                <Input
                  id="txn-counterparty"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="txn-desc">Description</Label>
                <Input
                  id="txn-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-ref">Reference number</Label>
                <Input
                  id="txn-ref"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div className="col-span-2 flex items-center gap-6 pt-2 sm:col-span-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="txn-recurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) =>
                      setIsRecurring(Boolean(checked))
                    }
                  />
                  <Label htmlFor="txn-recurring">Recurring</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="txn-transfer"
                    checked={isTransfer}
                    onCheckedChange={(checked) =>
                      setIsTransfer(Boolean(checked))
                    }
                  />
                  <Label htmlFor="txn-transfer">Own-account transfer</Label>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              Current extracted amount:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(transaction.amount)}
              </span>{" "}
              · {transaction.direction === "credit" ? "credit" : "debit"} ·{" "}
              {transaction.paymentMethod?.name ?? "no method"} ·{" "}
              {transaction.category?.name ?? "uncategorized"}
              <div className="mt-1">
                Created {formatDateTime(transaction.createdAt)} · Updated{" "}
                {formatDateTime(transaction.updatedAt)}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="outline"
            disabled={isPending || !transaction?.needsReview}
            onClick={handleConfirm}
          >
            {confirmMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {transaction?.needsReview ? "Confirm as reviewed" : "Reviewed"}
          </Button>
          <Button disabled={isPending} onClick={handleSave}>
            {updateMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
