"use client";

import * as React from "react";

import { transactionTypeLabels } from "@/lib/utils/transaction.utils";

import { formatDate } from "./constants";

export interface TransactionFilters {
  statementUploadId: string;
  bankAccountId: string;
  categoryId: string;
  paymentMethodId: string;
  transactionType: string;
  direction: string;
  search: string;
  markForReviewOnly: boolean;
  startDate: string;
  endDate: string;
}

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface SelectedFilterOptions {
  statement?: { originalFilename: string } | null;
  account?: { bankName?: string | null; lastFour?: string | null } | null;
  category?: { name: string } | null;
  paymentMethod?: { name: string } | null;
}

const initialFilters = (statementUploadId: string): TransactionFilters => ({
  statementUploadId,
  bankAccountId: "",
  categoryId: "",
  paymentMethodId: "",
  transactionType: "",
  direction: "",
  search: "",
  markForReviewOnly: false,
  startDate: "",
  endDate: "",
});

export function useTransactionFilters(initialStatementUploadId: string) {
  const [filters, setFilters] = React.useState<TransactionFilters>(() =>
    initialFilters(initialStatementUploadId),
  );
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);

  const update = (patch: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const reset = () => {
    setFilters(initialFilters(""));
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const advancedFilterCount = [
    filters.statementUploadId,
    filters.bankAccountId,
    filters.categoryId,
    filters.paymentMethodId,
    filters.transactionType,
    filters.markForReviewOnly,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  return {
    filters,
    update,
    reset,
    page,
    setPage,
    limit,
    setLimit,
    hasActiveFilters,
    advancedFilterCount,
  };
}

export function buildActiveFilterChips(params: {
  filters: TransactionFilters;
  selected?: SelectedFilterOptions;
  update: (patch: Partial<TransactionFilters>) => void;
}): ActiveFilterChip[] {
  const { filters, selected, update } = params;

  return [
    filters.search && {
      key: "search",
      label:
        filters.search.length > 24
          ? `${filters.search.slice(0, 24)}…`
          : filters.search,
      onRemove: () => update({ search: "" }),
    },
    filters.statementUploadId && {
      key: "statement",
      label: selected?.statement?.originalFilename ?? "Statement",
      onRemove: () => update({ statementUploadId: "" }),
    },
    filters.bankAccountId && {
      key: "account",
      label: selected?.account
        ? `${selected.account.bankName}${selected.account.lastFour ? ` ••${selected.account.lastFour}` : ""}`
        : "Account",
      onRemove: () => update({ bankAccountId: "" }),
    },
    filters.transactionType && {
      key: "type",
      label:
        transactionTypeLabels[
          filters.transactionType as keyof typeof transactionTypeLabels
        ],
      onRemove: () => update({ transactionType: "" }),
    },
    filters.direction && {
      key: "direction",
      label: filters.direction === "debit" ? "Debit" : "Credit",
      onRemove: () => update({ direction: "" }),
    },
    filters.categoryId && {
      key: "category",
      label: selected?.category?.name ?? "Category",
      onRemove: () => update({ categoryId: "" }),
    },
    filters.paymentMethodId && {
      key: "payment",
      label: selected?.paymentMethod?.name ?? "Payment",
      onRemove: () => update({ paymentMethodId: "" }),
    },
    filters.startDate && {
      key: "startDate",
      label: `From ${formatDate(filters.startDate)}`,
      onRemove: () => update({ startDate: "" }),
    },
    filters.endDate && {
      key: "endDate",
      label: `To ${formatDate(filters.endDate)}`,
      onRemove: () => update({ endDate: "" }),
    },
    filters.markForReviewOnly && {
      key: "review",
      label: "Needs review",
      onRemove: () => update({ markForReviewOnly: false }),
    },
  ].filter(Boolean) as ActiveFilterChip[];
}
