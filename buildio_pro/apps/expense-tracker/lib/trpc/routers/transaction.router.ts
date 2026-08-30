import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import z from "zod";

import { runTransactionEnrichment } from "@/lib/transactions";
import { needsReview } from "@/lib/utils/transaction.utils";

import { createTRPCRouter, protectedProcedure } from "../init";
import {
  calculatePagination,
  createPaginationMeta,
  paginationInputSchema,
} from "../schemas/pagination.schema";

const transactionIdInput = z.object({
  transactionId: z.uuid(),
});

const listTransactionsInput = paginationInputSchema.extend({
  bankAccountId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  paymentMethodId: z.uuid().optional(),
  statementUploadId: z.uuid().optional(),
  direction: z.enum(["debit", "credit"]).optional(),
  transactionType: z
    .enum([
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
    ])
    .optional(),
  search: z.string().trim().max(255).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  markForReviewOnly: z.boolean().default(false),
});

const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const transactionRouter = createTRPCRouter({
  listTransactions: protectedProcedure
    .input(listTransactionsInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const filters = [eq(dbSchema.financialTransaction.userId, user.id)];

      if (input.bankAccountId) {
        filters.push(
          eq(dbSchema.financialTransaction.bankAccountId, input.bankAccountId),
        );
      }
      if (input.categoryId) {
        filters.push(
          eq(dbSchema.financialTransaction.categoryId, input.categoryId),
        );
      }
      if (input.paymentMethodId) {
        filters.push(
          eq(
            dbSchema.financialTransaction.paymentMethodId,
            input.paymentMethodId,
          ),
        );
      }
      if (input.statementUploadId) {
        filters.push(
          eq(
            dbSchema.financialTransaction.statementUploadId,
            input.statementUploadId,
          ),
        );
      }
      if (input.direction) {
        filters.push(eq(dbSchema.financialTransaction.direction, input.direction));
      }
      if (input.transactionType) {
        filters.push(
          eq(dbSchema.financialTransaction.transactionType, input.transactionType),
        );
      }
      if (input.startDate) {
        filters.push(
          gte(
            dbSchema.financialTransaction.transactionDate,
            input.startDate,
          ),
        );
      }
      if (input.endDate) {
        filters.push(
          lte(dbSchema.financialTransaction.transactionDate, input.endDate),
        );
      }
      if (input.markForReviewOnly) {
        filters.push(
          lte(dbSchema.financialTransaction.extractionConfidence, "0.8"),
        );
      }
      if (input.search) {
        const term = `%${input.search}%`;
        filters.push(
          or(
            ilike(dbSchema.financialTransaction.merchantName, term),
            ilike(dbSchema.financialTransaction.description, term),
            ilike(dbSchema.financialTransaction.rawDescription, term),
            ilike(dbSchema.financialTransaction.counterpartyName, term),
            ilike(dbSchema.financialTransaction.referenceNumber, term),
          )!,
        );
      }

      const whereClause =
        filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.financialTransaction)
        .where(whereClause);

      const totalItems = Number(total?.count ?? 0);
      const { offset } = calculatePagination(input, totalItems);

      const transactions = await db.query.financialTransaction.findMany({
        limit: input.limit,
        offset,
        where: whereClause,
        with: {
          bankAccount: true,
          statementUpload: true,
          category: true,
          paymentMethod: true,
          linkedTransaction: true,
        },
        orderBy: (transaction, { desc }) =>
          desc(transaction.transactionDate),
      });

      return {
        data: transactions.map((transaction) => ({
          ...transaction,
          amount: numericToNumber(transaction.amount),
          balanceAfter: transaction.balanceAfter
            ? numericToNumber(transaction.balanceAfter)
            : null,
          extractionConfidence: transaction.extractionConfidence
            ? numericToNumber(transaction.extractionConfidence)
            : null,
          needsReview: needsReview(transaction.extractionConfidence),
        })),
        meta: createPaginationMeta(input, totalItems),
      };
    }),

  getTransactionById: protectedProcedure
    .input(transactionIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { transactionId } = input;

      const transaction = await db.query.financialTransaction.findFirst({
        where: and(
          eq(dbSchema.financialTransaction.id, transactionId),
          eq(dbSchema.financialTransaction.userId, user.id),
        ),
        with: {
          bankAccount: true,
          statementUpload: true,
          category: true,
          paymentMethod: true,
          linkedTransaction: true,
        },
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      return {
        ...transaction,
        amount: numericToNumber(transaction.amount),
        balanceAfter: transaction.balanceAfter
          ? numericToNumber(transaction.balanceAfter)
          : null,
        extractionConfidence: transaction.extractionConfidence
          ? numericToNumber(transaction.extractionConfidence)
          : null,
        needsReview: needsReview(transaction.extractionConfidence),
      };
    }),

  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transactions = await db.query.financialTransaction.findMany({
      where: eq(dbSchema.financialTransaction.userId, user.id),
    });

    const typeMap = new Map<string, number>();
    const categoryMap = new Map<string, number>();
    const monthMap = new Map<string, number>();
    let totalDebit = 0;
    let totalCredit = 0;
    let reviewCount = 0;

    for (const transaction of transactions) {
      const amount = numericToNumber(transaction.amount);
      if (transaction.direction === "debit") {
        totalDebit += amount;
      } else {
        totalCredit += amount;
      }
      if (needsReview(transaction.extractionConfidence)) {
        reviewCount += 1;
      }

      typeMap.set(
        transaction.transactionType,
        (typeMap.get(transaction.transactionType) || 0) + amount,
      );

      const categoryName =
        transaction.categoryId ?? "uncategorized";
      categoryMap.set(
        categoryName,
        (categoryMap.get(categoryName) || 0) + amount,
      );

      const d = new Date(transaction.transactionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) || 0) + amount);
    }

    const typeBreakdown = Array.from(typeMap.entries())
      .map(([type, amount]) => ({ type, amount }))
      .sort((a, b) => b.amount - a.amount);

    const monthlyBreakdown = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([rawDate, amount]) => {
        const [year, month] = rawDate.split("-");
        const date = new Date(parseInt(year!), parseInt(month!) - 1);
        return {
          month: date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          amount,
          rawDate,
        };
      });

    return {
      totalDebit,
      totalCredit,
      net: totalCredit - totalDebit,
      reviewCount,
      typeBreakdown,
      categoryBreakdown: Array.from(categoryMap.entries())
        .map(([categoryId, amount]) => ({ categoryId, amount }))
        .sort((a, b) => b.amount - a.amount),
      monthlyBreakdown,
    };
  }),

  listByStatement: protectedProcedure
    .input(
      z.object({
        statementUploadId: z.uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const statement = await db.query.statementUpload.findFirst({
        where: and(
          eq(dbSchema.statementUpload.id, input.statementUploadId),
          eq(dbSchema.statementUpload.userId, user.id),
        ),
      });

      if (!statement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Statement not found",
        });
      }

      const transactions = await db.query.financialTransaction.findMany({
        where: and(
          eq(dbSchema.financialTransaction.userId, user.id),
          eq(
            dbSchema.financialTransaction.statementUploadId,
            input.statementUploadId,
          ),
        ),
        orderBy: (transaction, { desc }) =>
          desc(transaction.transactionDate),
      });

      return transactions.map((transaction) => ({
        ...transaction,
        amount: numericToNumber(transaction.amount),
        needsReview: needsReview(transaction.extractionConfidence),
      }));
    }),

  runEnrichment: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    return runTransactionEnrichment({
      db,
      dbSchema,
      userId: user.id,
    });
  }),
});
