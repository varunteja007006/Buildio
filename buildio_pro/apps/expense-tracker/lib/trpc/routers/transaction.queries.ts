import { TRPCError } from "@trpc/server";
import { and, count, eq, gte, ilike, isNull, lte, or } from "drizzle-orm";
import z from "zod";

import { needsReview } from "@/lib/utils/transaction.utils";

import { protectedProcedure } from "../init";
import {
  listTransactionsInput,
  numericToNumber,
  transactionIdInput,
} from "./transaction.schemas";
import {
  calculatePagination,
  createPaginationMeta,
} from "../schemas/pagination.schema";

export const listTransactions = protectedProcedure
  .input(listTransactionsInput)
  .query(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;

    const filters = [
      eq(dbSchema.financialTransaction.userId, user.id),
      isNull(dbSchema.financialTransaction.supersededAt),
    ];

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
      filters.push(
        eq(dbSchema.financialTransaction.direction, input.direction),
      );
    }
    if (input.transactionType) {
      filters.push(
        eq(
          dbSchema.financialTransaction.transactionType,
          input.transactionType,
        ),
      );
    }
    if (input.startDate) {
      filters.push(
        gte(dbSchema.financialTransaction.transactionDate, input.startDate),
      );
    }
    if (input.endDate) {
      filters.push(
        lte(dbSchema.financialTransaction.transactionDate, input.endDate),
      );
    }
    if (input.markForReviewOnly) {
      filters.push(
        and(
          lte(dbSchema.financialTransaction.extractionConfidence, "0.8"),
          isNull(dbSchema.financialTransaction.reviewedAt),
        )!,
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

    const whereClause = filters.length === 1 ? filters[0] : and(...filters);

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
      orderBy: (transaction, { desc }) => desc(transaction.transactionDate),
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
        needsReview: needsReview(
          transaction.extractionConfidence,
          transaction.reviewedAt,
        ),
      })),
      meta: createPaginationMeta(input, totalItems),
    };
  });

export const getTransactionById = protectedProcedure
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
      needsReview: needsReview(
        transaction.extractionConfidence,
        transaction.reviewedAt,
      ),
    };
  });

export const listByStatement = protectedProcedure
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
        isNull(dbSchema.financialTransaction.supersededAt),
      ),
      orderBy: (transaction, { desc }) => desc(transaction.transactionDate),
    });

    return transactions.map((transaction) => ({
      ...transaction,
      amount: numericToNumber(transaction.amount),
      needsReview: needsReview(
        transaction.extractionConfidence,
        transaction.reviewedAt,
      ),
    }));
  });

export const listPaymentMethods = protectedProcedure.query(async ({ ctx }) => {
  const methods = await ctx.db.query.paymentMethods.findMany({
    orderBy: (method, { asc }) => asc(method.name),
  });

  return methods;
});

export const listBankAccounts = protectedProcedure.query(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  // Flat select instead of relational `with` — inferring the `bank`
  // relation through the full AppRouter type collapses to `never`.
  return db
    .select({
      id: dbSchema.userBankAccount.id,
      name: dbSchema.userBankAccount.name,
      lastFour: dbSchema.userBankAccount.lastFour,
      bankName: dbSchema.banks.name,
      accountTypeName: dbSchema.bankAccountTypes.name,
    })
    .from(dbSchema.userBankAccount)
    .leftJoin(
      dbSchema.banks,
      eq(dbSchema.banks.id, dbSchema.userBankAccount.bankId),
    )
    .leftJoin(
      dbSchema.bankAccountTypes,
      eq(
        dbSchema.bankAccountTypes.id,
        dbSchema.userBankAccount.bankAccountTypeId,
      ),
    )
    .where(eq(dbSchema.userBankAccount.user_id, user.id))
    .orderBy(dbSchema.userBankAccount.name);
});
