"use client";

import * as React from "react";

import type {
  TransactionDirection,
  TransactionType,
} from "@/hooks";

import { NO_SELECTION, toDateInputValue } from "./constants";
import type { ReviewTransaction } from "./review-transaction";

export interface ReviewFormState {
  merchant: string;
  description: string;
  counterparty: string;
  amount: string;
  date: string;
  direction: TransactionDirection;
  transactionType: TransactionType;
  categoryId: string;
  paymentMethodId: string;
  referenceNumber: string;
  balanceAfter: string;
  isRecurring: boolean;
  isTransfer: boolean;
}

const emptyForm: ReviewFormState = {
  merchant: "",
  description: "",
  counterparty: "",
  amount: "",
  date: "",
  direction: "debit",
  transactionType: "unknown",
  categoryId: NO_SELECTION,
  paymentMethodId: NO_SELECTION,
  referenceNumber: "",
  balanceAfter: "",
  isRecurring: false,
  isTransfer: false,
};

function formFromTransaction(transaction: ReviewTransaction): ReviewFormState {
  return {
    merchant: transaction.merchantName ?? "",
    description: transaction.description ?? "",
    counterparty: transaction.counterpartyName ?? "",
    amount: transaction.amount ? String(transaction.amount) : "",
    date: toDateInputValue(transaction.transactionDate),
    direction: transaction.direction,
    transactionType: transaction.transactionType,
    categoryId: transaction.categoryId ?? NO_SELECTION,
    paymentMethodId: transaction.paymentMethodId ?? NO_SELECTION,
    referenceNumber: transaction.referenceNumber ?? "",
    balanceAfter:
      transaction.balanceAfter == null ? "" : String(transaction.balanceAfter),
    isRecurring: transaction.isRecurring,
    isTransfer: transaction.isTransfer,
  };
}

export function useReviewForm(
  transaction: ReviewTransaction | null,
  open: boolean,
) {
  const [form, setForm] = React.useState<ReviewFormState>(emptyForm);

  React.useEffect(() => {
    if (!transaction || !open) return;
    setForm(formFromTransaction(transaction));
  }, [transaction, open]);

  const update = (patch: Partial<ReviewFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const buildPayload = () => {
    const parsedAmount = form.amount === "" ? null : Number(form.amount);
    const parsedBalance =
      form.balanceAfter === "" ? null : Number(form.balanceAfter);
    return {
      merchantName: form.merchant.trim() || null,
      description: form.description.trim() || null,
      counterpartyName: form.counterparty.trim() || null,
      amount:
        parsedAmount != null && Number.isFinite(parsedAmount)
          ? parsedAmount
          : undefined,
      transactionDate: form.date ? new Date(`${form.date}T12:00:00`) : undefined,
      direction: form.direction,
      transactionType: form.transactionType,
      categoryId: form.categoryId === NO_SELECTION ? null : form.categoryId,
      paymentMethodId:
        form.paymentMethodId === NO_SELECTION ? null : form.paymentMethodId,
      referenceNumber: form.referenceNumber.trim() || null,
      balanceAfter:
        parsedBalance != null && Number.isFinite(parsedBalance)
          ? parsedBalance
          : null,
      isRecurring: form.isRecurring,
      isTransfer: form.isTransfer,
    };
  };

  return { form, update, buildPayload };
}
