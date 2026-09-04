"use client";

import { Button } from "@workspace/ui/components/button";
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
import { CalendarRange, RotateCcw, SlidersHorizontal } from "lucide-react";

import { transactionTypeLabels } from "@/lib/utils/transaction.utils";

import type { TransactionFilters } from "./use-transaction-filters";

interface FilterOption {
  id: string;
  label: string;
}

interface TransactionsFilterPopoverProps {
  filters: TransactionFilters;
  statements?: FilterOption[];
  bankAccounts?: FilterOption[];
  categories?: FilterOption[];
  paymentMethods?: FilterOption[];
  onChange: (patch: Partial<TransactionFilters>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  advancedFilterCount: number;
}

export function TransactionsFilterPopover({
  filters,
  statements = [],
  bankAccounts = [],
  categories = [],
  paymentMethods = [],
  onChange,
  onReset,
  hasActiveFilters,
  advancedFilterCount,
}: TransactionsFilterPopoverProps) {
  return (
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
          <FilterSelect
            label="Statement"
            value={filters.statementUploadId}
            onChange={(value) => onChange({ statementUploadId: value })}
            options={statements}
            placeholder="All statements"
            fullWidth
          />

          <FilterSelect
            label="Account"
            value={filters.bankAccountId}
            onChange={(value) => onChange({ bankAccountId: value })}
            options={bankAccounts}
            placeholder="All accounts"
            fullWidth
          />

          <FilterSelect
            label="Type"
            value={filters.transactionType}
            onChange={(value) => onChange({ transactionType: value })}
            options={(
              Object.keys(transactionTypeLabels) as string[]
            ).map((value) => ({
              id: value,
              label:
                transactionTypeLabels[
                  value as keyof typeof transactionTypeLabels
                ],
            }))}
            placeholder="All types"
          />

          <FilterSelect
            label="Category"
            value={filters.categoryId}
            onChange={(value) => onChange({ categoryId: value })}
            options={categories}
            placeholder="All categories"
          />

          <FilterSelect
            label="Payment method"
            value={filters.paymentMethodId}
            onChange={(value) => onChange({ paymentMethodId: value })}
            options={paymentMethods}
            placeholder="All methods"
            fullWidth
          />

          <div className="col-span-2 space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarRange className="size-3.5" />
              Date range
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="w-full"
                value={filters.startDate}
                onChange={(e) => onChange({ startDate: e.target.value })}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                className="w-full"
                value={filters.endDate}
                onChange={(e) => onChange({ endDate: e.target.value })}
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
              onClick={onReset}
            >
              <RotateCcw className="size-3.5" />
              Reset all filters
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  fullWidth = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
