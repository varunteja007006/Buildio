import { z } from "zod/v4";

// OpenAI strict JSON-schema (response_format) requires:
// - every property of an object to be listed in `required`
// - optional values represented as `null`, not omitted
// - no `anyOf`/`oneOf` (so nullable fields must have NO checks)
//
// Validation/normalization therefore happens in the ingestion layer
// (lib/ai/ingest.ts) rather than in this schema.
const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();

export const transactionDirectionSchema = z.enum(["credit", "debit"]);

export const transactionTypeSchema = z.enum([
  "expense",
  "income",
  "transfer",
  "investment",
  "loan_payment",
  "insurance",
  "refund",
  "interest",
  "fee",
  "cash_withdrawal",
  "round_up",
  "unknown",
]);

export const paymentMethodSchema = z.enum([
  "UPI",
  "NEFT",
  "IMPS",
  "RTGS",
  "NACH",
  "ACH",
  "CARD",
  "ATM",
  "CASH",
  "OTHER",
]);

export const extractedTransactionSchema = z.object({
  date: z.string(),
  amount: z.coerce.number(),
  currency: nullableString,
  direction: z.string(),
  transactionType: z.string(),
  merchant: nullableString,
  counterparty: nullableString,
  category: nullableString,
  subcategory: nullableString,
  paymentMethod: z.string(),
  referenceNumber: nullableString,
  balanceAfter: nullableNumber,
  isRecurring: z.boolean(),
  isTransfer: z.boolean(),
  rawDescription: z.string(),
  extractionConfidence: z.coerce.number(),
  // Credit-card specific; null/false for bank statements.
  isEmi: z.boolean(),
  emiInstallmentNumber: nullableNumber,
  emiTotalInstallments: nullableNumber,
  international: z.boolean(),
  rewardPoints: nullableNumber,
});

export const extractedStatementSchema = z.object({
  bank: z.string(),
  accountType: nullableString,
  accountNumberMasked: nullableString,
  currency: nullableString,
  statementStart: nullableString,
  statementEnd: nullableString,
  openingBalance: nullableNumber,
  closingBalance: nullableNumber,
  // Credit-card specific; null for bank statements.
  cardProduct: nullableString,
  cardNetwork: nullableString,
  statementDate: nullableString,
  paymentDueDate: nullableString,
  totalAmountDue: nullableNumber,
  minimumAmountDue: nullableNumber,
  creditLimit: nullableNumber,
  availableCredit: nullableNumber,
  cashLimit: nullableNumber,
  availableCash: nullableNumber,
  // Required object (not .nullable()) so the OpenAI strict JSON schema
  // stays flat; the fields themselves carry the nullability.
  rewards: z.object({
    earned: nullableNumber,
    unit: nullableString,
  }),
});

export const extractedEmiSummarySchema = z.object({
  merchant: nullableString,
  originalAmount: nullableNumber,
  installmentNumber: nullableNumber,
  totalInstallments: nullableNumber,
  pendingInstallments: nullableNumber,
  outstanding: nullableNumber,
  monthlyInstallment: nullableNumber,
});

export const statementExtractionSchema = z.object({
  statement: extractedStatementSchema,
  transactions: z.array(extractedTransactionSchema),
  // Separate EMI tables (e.g. ICICI) that are not transaction rows.
  emiSummary: z.array(extractedEmiSummarySchema),
});

export type ExtractedTransaction = z.infer<typeof extractedTransactionSchema>;
export type ExtractedStatement = z.infer<typeof extractedStatementSchema>;
export type ExtractedEmiSummary = z.infer<typeof extractedEmiSummarySchema>;
export type StatementExtraction = z.infer<typeof statementExtractionSchema>;
