import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  bulkDeleteInput,
  createIncomeInput,
  incomeIdInput,
  toIncomeDto,
  updateIncomeInput,
} from "./income.schemas";

export const createIncome = protectedProcedure
  .input(createIncomeInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;

    if (input.sourceId) {
      const sourceExists = await db.query.incomeSource.findFirst({
        where: eq(dbSchema.incomeSource.id, input.sourceId),
      });

      if (!sourceExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Income source not found",
        });
      }
    }

    const result = await db.transaction(async (tx) => {
      const [transaction] = await tx
        .insert(dbSchema.financialTransaction)
        .values({
          userId: user.id,
          amount: input.amount,
          direction: "credit",
          transactionType: "income",
          merchantName: input.name,
          description: input.name,
        })
        .returning();

      const [incomeRecord] = await tx
        .insert(dbSchema.income)
        .values({
          userId: user.id,
          transactionId: transaction!.id,
          name: input.name,
          sourceId: input.sourceId || null,
        })
        .returning();

      const [row] = await tx
        .select({
          income: dbSchema.income,
          transaction: dbSchema.financialTransaction,
          source: dbSchema.incomeSource,
        })
        .from(dbSchema.income)
        .innerJoin(
          dbSchema.financialTransaction,
          eq(dbSchema.income.transactionId, dbSchema.financialTransaction.id),
        )
        .leftJoin(
          dbSchema.incomeSource,
          eq(dbSchema.income.sourceId, dbSchema.incomeSource.id),
        )
        .where(eq(dbSchema.income.id, incomeRecord!.id))
        .limit(1);

      return row;
    });

    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create income",
      });
    }

    return toIncomeDto(result);
  });

export const updateIncome = protectedProcedure
  .input(updateIncomeInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { incomeId, ...updates } = input;

    const existingIncome = await db.query.income.findFirst({
      where: and(
        eq(dbSchema.income.id, incomeId),
        eq(dbSchema.income.userId, user.id),
      ),
    });

    if (!existingIncome) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Income not found" });
    }

    if (updates.sourceId !== undefined && updates.sourceId !== null) {
      const sourceExists = await db.query.incomeSource.findFirst({
        where: eq(dbSchema.incomeSource.id, updates.sourceId),
      });

      if (!sourceExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Income source not found",
        });
      }
    }

    await db.transaction(async (tx) => {
      const incomePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (updates.name !== undefined) {
        incomePayload.name = updates.name;
      }
      if (updates.sourceId !== undefined) {
        incomePayload.sourceId = updates.sourceId;
      }

      await tx
        .update(dbSchema.income)
        .set(incomePayload)
        .where(
          and(
            eq(dbSchema.income.id, incomeId),
            eq(dbSchema.income.userId, user.id),
          ),
        );

      if (updates.amount !== undefined || updates.name !== undefined) {
        const transactionPayload: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        if (updates.amount !== undefined) {
          transactionPayload.amount = updates.amount;
        }
        if (updates.name !== undefined) {
          transactionPayload.merchantName = updates.name;
          transactionPayload.description = updates.name;
        }
        await tx
          .update(dbSchema.financialTransaction)
          .set(transactionPayload)
          .where(
            eq(
              dbSchema.financialTransaction.id,
              existingIncome.transactionId,
            ),
          );
      }
    });

    const [row] = await db
      .select({
        income: dbSchema.income,
        transaction: dbSchema.financialTransaction,
        source: dbSchema.incomeSource,
      })
      .from(dbSchema.income)
      .innerJoin(
        dbSchema.financialTransaction,
        eq(dbSchema.income.transactionId, dbSchema.financialTransaction.id),
      )
      .leftJoin(
        dbSchema.incomeSource,
        eq(dbSchema.income.sourceId, dbSchema.incomeSource.id),
      )
      .where(eq(dbSchema.income.id, incomeId))
      .limit(1);

    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Income not found" });
    }

    return toIncomeDto(row);
  });

export const deleteIncome = protectedProcedure
  .input(incomeIdInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { incomeId } = input;

    const incomeExists = await db.query.income.findFirst({
      where: and(
        eq(dbSchema.income.id, incomeId),
        eq(dbSchema.income.userId, user.id),
      ),
    });

    if (!incomeExists) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Income not found" });
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(dbSchema.income)
        .where(
          and(
            eq(dbSchema.income.id, incomeId),
            eq(dbSchema.income.userId, user.id),
          ),
        );
      await tx
        .delete(dbSchema.financialTransaction)
        .where(
          eq(dbSchema.financialTransaction.id, incomeExists.transactionId),
        );
    });

    return { success: true };
  });

export const deleteIncomes = protectedProcedure
  .input(bulkDeleteInput)
  .mutation(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { incomeIds } = input;

    const existingIncomes = await db.query.income.findMany({
      where: and(
        inArray(dbSchema.income.id, incomeIds),
        eq(dbSchema.income.userId, user.id),
      ),
    });

    const existingIncomeIds = new Set(
      existingIncomes.map((income) => income.id),
    );
    const transactionIds = existingIncomes.map(
      (income) => income.transactionId,
    );

    const missingIds = incomeIds.filter((id) => !existingIncomeIds.has(id));

    if (existingIncomes.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No incomes found to delete",
      });
    }

    if (existingIncomes.length > 0) {
      await db.transaction(async (tx) => {
        await tx
          .delete(dbSchema.income)
          .where(
            and(
              inArray(dbSchema.income.id, Array.from(existingIncomeIds)),
              eq(dbSchema.income.userId, user.id),
            ),
          );
        await tx
          .delete(dbSchema.financialTransaction)
          .where(inArray(dbSchema.financialTransaction.id, transactionIds));
      });
    }

    return {
      success: true,
      deletedIds: Array.from(existingIncomeIds),
      notFoundIds: missingIds,
      skipped: [],
      message: `${existingIncomeIds.size} income(s) deleted successfully`,
    };
  });
