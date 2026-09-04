"use client";

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

import type {
  TransactionDirection,
  TransactionType,
} from "@/hooks";
import { transactionTypeOptions } from "@/lib/utils/transaction.utils";

import { NO_SELECTION } from "./constants";
import type { ReviewFormState } from "./use-review-form";

interface CategoryOption {
  id: string;
  name: string;
}

interface PaymentMethodOption {
  id: string;
  name: string;
}

export function TransactionFormFields({
  form,
  update,
  categories,
  paymentMethods,
}: {
  form: ReviewFormState;
  update: (patch: Partial<ReviewFormState>) => void;
  categories: CategoryOption[];
  paymentMethods: PaymentMethodOption[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="txn-amount">Amount</Label>
        <Input
          id="txn-amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => update({ amount: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="txn-date">Date</Label>
        <Input
          id="txn-date"
          type="date"
          value={form.date}
          onChange={(e) => update({ date: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Direction</Label>
        <Select
          value={form.direction}
          onValueChange={(value) =>
            update({ direction: value as TransactionDirection })
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
          value={form.transactionType}
          onValueChange={(value) =>
            update({ transactionType: value as TransactionType })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {transactionTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={form.categoryId} onValueChange={(value) => update({ categoryId: value })}>
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
          value={form.paymentMethodId}
          onValueChange={(value) => update({ paymentMethodId: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_SELECTION}>None</SelectItem>
            {paymentMethods.map((method) => (
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
          value={form.merchant}
          onChange={(e) => update({ merchant: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="txn-balance">Balance after</Label>
        <Input
          id="txn-balance"
          type="number"
          step="0.01"
          value={form.balanceAfter}
          onChange={(e) => update({ balanceAfter: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="txn-counterparty">Counterparty</Label>
        <Input
          id="txn-counterparty"
          value={form.counterparty}
          onChange={(e) => update({ counterparty: e.target.value })}
        />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label htmlFor="txn-desc">Description</Label>
        <Input
          id="txn-desc"
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="txn-ref">Reference number</Label>
        <Input
          id="txn-ref"
          value={form.referenceNumber}
          onChange={(e) => update({ referenceNumber: e.target.value })}
        />
      </div>
      <div className="col-span-2 flex items-center gap-6 pt-2 sm:col-span-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="txn-recurring"
            checked={form.isRecurring}
            onCheckedChange={(checked) => update({ isRecurring: Boolean(checked) })}
          />
          <Label htmlFor="txn-recurring">Recurring</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="txn-transfer"
            checked={form.isTransfer}
            onCheckedChange={(checked) => update({ isTransfer: Boolean(checked) })}
          />
          <Label htmlFor="txn-transfer">Own-account transfer</Label>
        </div>
      </div>
    </div>
  );
}
