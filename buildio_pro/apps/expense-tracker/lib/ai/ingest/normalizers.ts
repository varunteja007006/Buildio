import { z } from "zod/v4";

import { paymentMethodSchema, transactionTypeSchema } from "../schema";

const CURRENCY_DEFAULTS: Record<
  string,
  { symbol: string; name: string; symbolNative: string; decimalDigits: number }
> = {
  INR: {
    symbol: "₹",
    name: "Indian Rupee",
    symbolNative: "₹",
    decimalDigits: 2,
  },
  USD: { symbol: "$", name: "US Dollar", symbolNative: "$", decimalDigits: 2 },
  EUR: { symbol: "€", name: "Euro", symbolNative: "€", decimalDigits: 2 },
  GBP: {
    symbol: "£",
    name: "British Pound",
    symbolNative: "£",
    decimalDigits: 2,
  },
  JPY: {
    symbol: "¥",
    name: "Japanese Yen",
    symbolNative: "¥",
    decimalDigits: 0,
  },
};

const TRANSACTION_TYPES = transactionTypeSchema.options;
const PAYMENT_METHODS = paymentMethodSchema.options;

export function slugify(value: string): string {
  return value
    .replace(/[^a-z0-9]/gi, " ")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function pad2(value: string): string {
  return value.padStart(2, "0");
}

/**
 * Accepts YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, DD-MM-YYYY, DD/MM/YYYY and
 * DD.MM.YYYY; returns the ISO YYYY-MM-DD form.
 */
export function normalizeDate(value: string): string {
  const raw = value.trim();
  let match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) return `${match[1]}-${pad2(match[2]!)}-${pad2(match[3]!)}`;
  match = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) return `${match[3]}-${pad2(match[2]!)}-${pad2(match[1]!)}`;
  throw new Error(`Unrecognized transaction date format: "${value}"`);
}

export function normalizeDirection(value: string): "credit" | "debit" {
  const normalized = value.trim().toLowerCase();
  if (normalized === "credit" || normalized === "cr") return "credit";
  if (normalized === "debit" || normalized === "dr") return "debit";
  throw new Error(`Unrecognized transaction direction: "${value}"`);
}

export function normalizeTransactionType(
  value: string,
): z.infer<typeof transactionTypeSchema> {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "_");
  const exact = (TRANSACTION_TYPES as readonly string[]).find(
    (option) => option === normalized,
  );
  if (exact) return exact as z.infer<typeof transactionTypeSchema>;
  if (
    normalized === "loan" ||
    normalized === "emi" ||
    normalized === "housingloan"
  ) {
    return "loan_payment";
  }
  if (
    normalized === "premium" ||
    normalized === "ins" ||
    normalized === "insurancepremium"
  ) {
    return "insurance";
  }
  if (normalized === "sip" || normalized === "invest" || normalized === "mf") {
    return "investment";
  }
  if (
    normalized === "rfd" ||
    normalized === "cashback" ||
    normalized === "reversal"
  ) {
    return "refund";
  }
  if (normalized === "int" || normalized === "interestincome") {
    return "interest";
  }
  if (
    normalized === "charges" ||
    normalized === "bankfee" ||
    normalized === "penalty"
  ) {
    return "fee";
  }
  if (normalized === "withdrawal" || normalized === "atmwithdrawal") {
    return "cash_withdrawal";
  }
  if (normalized === "roundups" || normalized === "roundup") {
    return "round_up";
  }
  if (normalized === "owntransfer" || normalized === "accounttransfer") {
    return "transfer";
  }
  if (normalized === "salary") {
    return "income";
  }
  if (normalized === "purchase" || normalized === "cardpayment") {
    return "expense";
  }
  return "unknown";
}

export function normalizePaymentMethod(
  value: string,
): z.infer<typeof paymentMethodSchema> {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const exact = (PAYMENT_METHODS as readonly string[]).find(
    (option) => option === normalized,
  );
  if (exact) return exact as z.infer<typeof paymentMethodSchema>;
  if (normalized.includes("UPI")) return "UPI";
  if (normalized.includes("NEFT")) return "NEFT";
  if (normalized.includes("IMPS")) return "IMPS";
  if (normalized.includes("RTGS")) return "RTGS";
  if (normalized.includes("NACH")) return "NACH";
  if (normalized.includes("ACH")) return "ACH";
  if (
    normalized.includes("POS") ||
    normalized.includes("CARD") ||
    normalized.includes("DEBIT") ||
    normalized.includes("CREDIT") ||
    normalized.includes("SWIPE")
  ) {
    return "CARD";
  }
  if (normalized.includes("ATM") || normalized.includes("WITHDRAW")) {
    return "ATM";
  }
  if (normalized.includes("CASH")) return "CASH";
  return "OTHER";
}

export function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

export function maskAccountNumber(value: string | null | undefined): {
  masked: string | null;
  lastFour: string | null;
} {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return { masked: null, lastFour: null };
  const lastFour = digits.slice(-4);
  return { masked: `****${lastFour}`, lastFour };
}

export { CURRENCY_DEFAULTS };
