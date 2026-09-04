import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";

import { runTransactionEnrichment } from "@/lib/transactions";
import { needsReview } from "@/lib/utils/transaction.utils";

import { protectedProcedure } from "../init";
import {
  bulkDeleteTransactionsInput,
  numericToNumber,
  transactionIdInput,
  updateTransactionInput,
} from "./transaction.schemas";

export const runEnrichment = protectedProcedure.mutation(async ({ ctx }) => {
  const { db, dbSchema, user } = ctx;

  return runTransactionEnrichment({
    db,
    dbSchema,
    userId: user.id,
  });
});

export const updateTransaction = protectedProcedure
  .input(updateTransactionInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { transactionId, ...fields } = input;

    const transaction = await db.query.financialTransaction.findFirst({
      where: and(
        eq(dbSchema.financialTransaction.id, transactionId),
        eq(dbSchema.financialTransaction.userId, user.id),
      ),
    });

    if (!transaction) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    const payload: Record<string, unknown> = {
      updatedAt: new Date(),
      // editing implies the reviewer has verified the row
      reviewedAt: new Date(),
    };
    if (fields.merchantName !== undefined) {
      payload.merchantName = fields.merchantName;
    }
    if (fields.counterpartyName !== undefined) {
      payload.counterpartyName = fields.counterpartyName;
    }
    if (fields.description !== undefined) {
      payload.description = fields.description;
    }
    if (fields.categoryId !== undefined) {
      payload.categoryId = fields.categoryId;
    }
    if (fields.paymentMethodId !== undefined) {
      payload.paymentMethodId = fields.paymentMethodId;
    }
    if (fields.transactionType !== undefined) {
      payload.transactionType = fields.transactionType;
    }
    if (fields.direction !== undefined) {
      payload.direction = fields.direction;
    }
    if (fields.transactionDate !== undefined) {
      payload.transactionDate = fields.transactionDate;
    }
    if (fields.amount !== undefined) {
      payload.amount = fields.amount.toFixed(4);
    }
    if (fields.referenceNumber !== undefined) {
      payload.referenceNumber = fields.referenceNumber;
    }
    if (fields.isRecurring !== undefined) {
      payload.isRecurring = fields.isRecurring;
    }
    if (fields.isTransfer !== undefined) {
      payload.isTransfer = fields.isTransfer;
    }
    if (fields.isEmi !== undefined) {
      payload.isEmi = fields.isEmi;
    }
    if (fields.emiInstallmentNumber !== undefined) {
      payload.emiInstallmentNumber = fields.emiInstallmentNumber;
    }
    if (fields.emiTotalInstallments !== undefined) {
      payload.emiTotalInstallments = fields.emiTotalInstallments;
    }
    if (fields.international !== undefined) {
      payload.international = fields.international;
    }
    if (fields.rewardPoints !== undefined) {
      payload.rewardPoints =
        fields.rewardPoints === null ? null : fields.rewardPoints.toFixed(4);
    }
    if (fields.balanceAfter !== undefined) {
      payload.balanceAfter =
        fields.balanceAfter === null ? null : fields.balanceAfter.toFixed(4);
    }

    const [updated] = await db
      .update(dbSchema.financialTransaction)
      .set(payload)
      .where(eq(dbSchema.financialTransaction.id, transactionId))
      .returning();

    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update transaction",
      });
    }

    return {
      ...updated,
      amount: numericToNumber(updated.amount),
      balanceAfter: updated.balanceAfter
        ? numericToNumber(updated.balanceAfter)
        : null,
      extractionConfidence: updated.extractionConfidence
        ? numericToNumber(updated.extractionConfidence)
        : null,
      needsReview: needsReview(
        updated.extractionConfidence,
        updated.reviewedAt,
      ),
    };
  });

export const deleteTransaction = protectedProcedure
  .input(transactionIdInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transaction = await db.query.financialTransaction.findFirst({
      where: and(
        eq(dbSchema.financialTransaction.id, input.transactionId),
        eq(dbSchema.financialTransaction.userId, user.id),
      ),
    });

    if (!transaction) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    const [deleted] = await db
      .delete(dbSchema.financialTransaction)
      .where(eq(dbSchema.financialTransaction.id, input.transactionId))
      .returning({ id: dbSchema.financialTransaction.id });

    if (!deleted) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete transaction",
      });
    }

    return { id: deleted.id };
  });

export const deleteTransactions = protectedProcedure
  .input(bulkDeleteTransactionsInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { transactionIds } = input;

    const deleted = await db
      .delete(dbSchema.financialTransaction)
      .where(
        and(
          inArray(dbSchema.financialTransaction.id, transactionIds),
          eq(dbSchema.financialTransaction.userId, user.id),
        ),
      )
      .returning({ id: dbSchema.financialTransaction.id });

    return { deletedIds: deleted.map((transaction) => transaction.id) };
  });

export const confirmTransaction = protectedProcedure
  .input(transactionIdInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;

    const transaction = await db.query.financialTransaction.findFirst({
      where: and(
        eq(dbSchema.financialTransaction.id, input.transactionId),
        eq(dbSchema.financialTransaction.userId, user.id),
      ),
    });

    if (!transaction) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    const [updated] = await db
      .update(dbSchema.financialTransaction)
      .set({
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dbSchema.financialTransaction.id, input.transactionId))
      .returning();

    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to confirm transaction",
      });
    }

    return {
      ...updated,
      amount: numericToNumber(updated.amount),
      balanceAfter: updated.balanceAfter
        ? numericToNumber(updated.balanceAfter)
        : null,
      extractionConfidence: updated.extractionConfidence
        ? numericToNumber(updated.extractionConfidence)
        : null,
      needsReview: needsReview(
        updated.extractionConfidence,
        updated.reviewedAt,
      ),
    };
  });
