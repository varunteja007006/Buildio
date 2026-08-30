import { createHash } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";
import "server-only";
import { z } from "zod/v4";

import { db, dbSchema } from "@/lib/db";
import { runTransactionEnrichment } from "@/lib/transactions";

import type {
  ExtractedTransaction,
  StatementExtraction,
} from "./schema";
import { paymentMethodSchema, transactionTypeSchema } from "./schema";

const CURRENCY_DEFAULTS: Record<
  string,
  { symbol: string; name: string; symbolNative: string; decimalDigits: number }
> = {
  INR: { symbol: "₹", name: "Indian Rupee", symbolNative: "₹", decimalDigits: 2 },
  USD: { symbol: "$", name: "US Dollar", symbolNative: "$", decimalDigits: 2 },
  EUR: { symbol: "€", name: "Euro", symbolNative: "€", decimalDigits: 2 },
  GBP: { symbol: "£", name: "British Pound", symbolNative: "£", decimalDigits: 2 },
  JPY: { symbol: "¥", name: "Japanese Yen", symbolNative: "¥", decimalDigits: 0 },
};

const TRANSACTION_TYPES = transactionTypeSchema.options;
const PAYMENT_METHODS = paymentMethodSchema.options;

function slugify(value: string): string {
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
function normalizeDate(value: string): string {
  const raw = value.trim();
  let match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) return `${match[1]}-${pad2(match[2]!)}-${pad2(match[3]!)}`;
  match = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) return `${match[3]}-${pad2(match[2]!)}-${pad2(match[1]!)}`;
  throw new Error(`Unrecognized transaction date format: "${value}"`);
}

function normalizeDirection(value: string): "credit" | "debit" {
  const normalized = value.trim().toLowerCase();
  if (normalized === "credit" || normalized === "cr") return "credit";
  if (normalized === "debit" || normalized === "dr") return "debit";
  throw new Error(`Unrecognized transaction direction: "${value}"`);
}

function normalizeTransactionType(
  value: string,
): z.infer<typeof transactionTypeSchema> {
  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, "_");
  const exact = (TRANSACTION_TYPES as readonly string[]).find(
    (option) => option === normalized,
  );
  if (exact) return exact as z.infer<typeof transactionTypeSchema>;
  if (normalized === "loan" || normalized === "emi" || normalized === "housingloan") {
    return "loan_payment";
  }
  if (normalized === "premium" || normalized === "ins" || normalized === "insurancepremium") {
    return "insurance";
  }
  if (normalized === "sip" || normalized === "invest" || normalized === "mf") {
    return "investment";
  }
  if (normalized === "rfd" || normalized === "cashback" || normalized === "reversal") {
    return "refund";
  }
  if (normalized === "int" || normalized === "interestincome") {
    return "interest";
  }
  if (normalized === "charges" || normalized === "bankfee" || normalized === "penalty") {
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

function normalizePaymentMethod(
  value: string,
): z.infer<typeof paymentMethodSchema> {
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
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

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

function maskAccountNumber(value: string | null | undefined): {
  masked: string | null;
  lastFour: string | null;
} {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return { masked: null, lastFour: null };
  const lastFour = digits.slice(-4);
  return { masked: `****${lastFour}`, lastFour };
}

function computeTransactionHash(input: {
  bankAccountId?: string | null;
  date: string;
  amount: number;
  referenceNumber?: string | null;
  rawDescription?: string | null;
}): string {
  const parts = [
    input.bankAccountId ?? "",
    input.date,
    input.amount.toFixed(2),
    input.referenceNumber?.trim() ?? "",
    input.rawDescription?.trim() ?? "",
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

/**
 * Resolves and lazily caches reference rows (currency, bank, payment method,
 * category, ...) for a single ingestion run.
 */
class ReferenceResolver {
  private currencyCache = new Map<string, string>();
  private bankCache = new Map<string, string>();
  private accountTypeCache = new Map<string, string>();
  private bankAccountCache = new Map<string, string>();
  private paymentProviderCache = new Map<string, string>();
  private paymentMethodCache = new Map<string, string>();
  private categoryCache = new Map<string, string>();

  constructor(private readonly userId: string) {}

  async currency(code: string): Promise<string> {
    const key = code.trim().toUpperCase();
    const cached = this.currencyCache.get(key);
    if (cached) return cached;

    let row = await db.query.currency.findFirst({
      where: eq(dbSchema.currency.code, key),
    });

    if (!row) {
      const defaults = CURRENCY_DEFAULTS[key] ?? {
        symbol: key,
        name: key,
        symbolNative: key,
        decimalDigits: 2,
      };
      [row] = await db
        .insert(dbSchema.currency)
        .values({
          code: key,
          symbol: defaults.symbol,
          name: defaults.name,
          symbolNative: defaults.symbolNative,
          decimalDigits: defaults.decimalDigits,
          rounding: "0",
        })
        .returning();
    }

    if (!row) throw new Error(`Failed to resolve currency ${key}`);

    this.currencyCache.set(key, row.id);
    return row.id;
  }

  async bank(name: string): Promise<string> {
    const key = name.trim();
    const cached = this.bankCache.get(key);
    if (cached) return cached;

    let row = await db.query.banks.findFirst({
      where: eq(dbSchema.banks.name, key),
    });

    if (!row) {
      [row] = await db
        .insert(dbSchema.banks)
        .values({
          name: key,
          code: slugify(key),
          type: "Bank",
        })
        .returning();
    }

    if (!row) throw new Error(`Failed to resolve bank ${key}`);

    this.bankCache.set(key, row.id);
    return row.id;
  }

  async accountType(name: string): Promise<string> {
    const key = name.trim().toUpperCase().replace(/\s+ACCOUNT$/, "");
    const cached = this.accountTypeCache.get(key);
    if (cached) return cached;

    let row = await db.query.bankAccountTypes.findFirst({
      where: eq(dbSchema.bankAccountTypes.name, key),
    });

    if (!row) {
      [row] = await db
        .insert(dbSchema.bankAccountTypes)
        .values({ name: key, description: key })
        .returning();
    }

    if (!row) throw new Error(`Failed to resolve account type ${key}`);

    this.accountTypeCache.set(key, row.id);
    return row.id;
  }

  async bankAccount(input: {
    bankId: string;
    accountTypeId: string;
    masked: string;
    lastFour: string | null;
    currencyId: string;
  }): Promise<string> {
    const matchKey = input.lastFour ?? input.masked;
    const cached = this.bankAccountCache.get(matchKey);
    if (cached) return cached;

    let row = await db.query.userBankAccount.findFirst({
      where: and(
        eq(dbSchema.userBankAccount.user_id, this.userId),
        input.lastFour
          ? eq(dbSchema.userBankAccount.lastFour, input.lastFour)
          : eq(dbSchema.userBankAccount.accountNumberMasked, input.masked),
      ),
    });

    if (!row) {
      [row] = await db
        .insert(dbSchema.userBankAccount)
        .values({
          user_id: this.userId,
          name: input.lastFour
            ? `Bank Account (****${input.lastFour})`
            : `Bank Account (${input.masked})`,
          bankAccountTypeId: input.accountTypeId,
          bankId: input.bankId,
          accountNumberMasked: input.masked,
          accountNumberHash: createHash("sha256")
            .update(input.masked)
            .digest("hex"),
          currencyId: input.currencyId,
          lastFour: input.lastFour,
        })
        .returning();
    }

    if (!row) {
      throw new Error("Failed to resolve or create bank account");
    }

    this.bankAccountCache.set(matchKey, row.id);
    return row.id;
  }

  async paymentMethod(name: string): Promise<string> {
    const key = name.trim().toUpperCase();
    const cached = this.paymentMethodCache.get(key);
    if (cached) return cached;

    let row = await db.query.paymentMethods.findFirst({
      where: eq(dbSchema.paymentMethods.name, key),
    });

    if (!row) {
      let provider = await db.query.paymentProvider.findFirst({
        where: eq(dbSchema.paymentProvider.name, "Banking"),
      });
      if (!provider) {
        [provider] = await db
          .insert(dbSchema.paymentProvider)
          .values({ name: "Banking", description: "Bank payment channels" })
          .returning();
      }
      if (!provider) throw new Error("Failed to resolve payment provider");
      [row] = await db
        .insert(dbSchema.paymentMethods)
        .values({
          name: key,
          description: key,
          paymentProviderId: provider.id,
        })
        .returning();
    }

    if (!row) throw new Error(`Failed to resolve payment method ${key}`);

    this.paymentMethodCache.set(key, row.id);
    return row.id;
  }

  async category(
    name: string,
    parentId?: string,
  ): Promise<string> {
    const key = `${parentId ?? ""}|${name.trim()}`;
    const cached = this.categoryCache.get(key);
    if (cached) return cached;

    let row = await db.query.expenseCategory.findFirst({
      where: and(
        eq(dbSchema.expenseCategory.name, name.trim()),
        parentId
          ? eq(dbSchema.expenseCategory.parentId, parentId)
          : isNull(dbSchema.expenseCategory.parentId),
      ),
    });

    if (!row) {
      [row] = await db
        .insert(dbSchema.expenseCategory)
        .values({
          name: name.trim(),
          description: name.trim(),
          ...(parentId ? { parentId } : {}),
        })
        .returning();
    }

    if (!row) throw new Error(`Failed to resolve category ${name}`);

    this.categoryCache.set(key, row.id);
    return row.id;
  }

  async resolveCategory(
    transaction: ExtractedTransaction,
  ): Promise<string | null> {
    const category = transaction.category?.trim();
    const subcategory = transaction.subcategory?.trim();
    if (!category) {
      return subcategory ? this.category(subcategory) : null;
    }
    const parentId = await this.category(category);
    return subcategory ? this.category(subcategory, parentId) : parentId;
  }
}

export type IngestStatementInput = {
  userId: string;
  statementUploadId: string;
  extractionModel: string;
  extraction: StatementExtraction;
};

export type IngestStatementResult = {
  extractedCount: number;
  insertedCount: number;
  skippedCount: number;
  bankAccountId: string | null;
  enrichment: {
    transfersCreated: number;
    refundsLinked: number;
    recurringMarked: number;
  };
};

/**
 * Persists AI-extracted transactions for a statement upload, deduplicating
 * against previously-inserted transactions, then runs enrichment (transfer
 * matching, refund linking, recurring detection).
 */
export async function ingestStatementExtraction(
  input: IngestStatementInput,
): Promise<IngestStatementResult> {
  const { userId, statementUploadId, extractionModel, extraction } = input;
  const resolver = new ReferenceResolver(userId);

  const currencyId = await resolver.currency(
    extraction.statement.currency?.trim() || "INR",
  );

  let bankAccountId: string | null = null;
  const bankName = extraction.statement.bank?.trim();
  const { masked: maskedAccountNumber, lastFour } = maskAccountNumber(
    extraction.statement.accountNumberMasked,
  );
  if (bankName && maskedAccountNumber) {
    const bankId = await resolver.bank(bankName);
    const accountTypeId = await resolver.accountType(
      extraction.statement.accountType?.trim() || "Savings",
    );
    bankAccountId = await resolver.bankAccount({
      bankId,
      accountTypeId,
      masked: maskedAccountNumber,
      lastFour,
      currencyId,
    });
  }

  const rows: (typeof dbSchema.financialTransaction.$inferInsert)[] = [];

  for (const transaction of extraction.transactions) {
    const rawDescription = transaction.rawDescription?.trim();
    if (!rawDescription) {
      throw new Error(
        "A transaction is missing its raw description; refusing to ingest partial data.",
      );
    }

    const date = normalizeDate(transaction.date);
    const amount = Math.abs(Number(transaction.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(
        `Invalid amount "${transaction.amount}" for transaction on ${date}.`,
      );
    }

    const categoryId = await resolver.resolveCategory(transaction);
    const paymentMethodId = await resolver.paymentMethod(
      normalizePaymentMethod(transaction.paymentMethod ?? "OTHER"),
    );

    rows.push({
      userId,
      bankAccountId,
      statementUploadId,
      transactionDate: new Date(`${date}T12:00:00`),
      amount: amount.toFixed(4),
      currencyId,
      direction: normalizeDirection(transaction.direction),
      transactionType: normalizeTransactionType(transaction.transactionType),
      merchantName: transaction.merchant?.trim() || null,
      counterpartyName: transaction.counterparty?.trim() || null,
      description: transaction.merchant?.trim() || null,
      rawDescription,
      referenceNumber: transaction.referenceNumber?.trim() || null,
      balanceAfter: transaction.balanceAfter?.toFixed(4) ?? null,
      paymentMethodId,
      categoryId,
      isRecurring: transaction.isRecurring,
      isTransfer: transaction.isTransfer,
      extractionConfidence: clampConfidence(
        Number(transaction.extractionConfidence),
      ).toFixed(4),
      transactionHash: computeTransactionHash({
        bankAccountId,
        date,
        amount,
        referenceNumber: transaction.referenceNumber,
        rawDescription,
      }),
    });
  }

  const inserted = rows.length
    ? await db
        .insert(dbSchema.financialTransaction)
        .values(rows)
        .onConflictDoNothing()
        .returning({ id: dbSchema.financialTransaction.id })
    : [];

  const enrichment = await runTransactionEnrichment({
    db,
    dbSchema,
    userId,
  });

  await db
    .update(dbSchema.statementUpload)
    .set({
      status: "processed",
      processedTransactionsCount: inserted.length,
      extractionModel,
      statementMetadata: extraction.statement,
      processingError: null,
      updatedAt: new Date(),
    })
    .where(eq(dbSchema.statementUpload.id, statementUploadId));

  return {
    extractedCount: extraction.transactions.length,
    insertedCount: inserted.length,
    skippedCount: extraction.transactions.length - inserted.length,
    bankAccountId,
    enrichment,
  };
}
