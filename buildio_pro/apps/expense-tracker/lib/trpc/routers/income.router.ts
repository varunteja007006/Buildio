import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";
import {
  calculatePagination,
  createPaginationMeta,
  paginationInputSchema,
} from "../schemas/pagination.schema";

const amountSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((value) => Number(value) > 0, {
    message: "Amount must be greater than zero",
  });

const createIncomeInput = z.object({
  name: z.string().min(1, "Income name required").max(255),
  amount: amountSchema,
  sourceId: z.uuid().optional(),
});

const updateIncomeInput = z
  .object({
    incomeId: z.uuid(),
    name: z.string().min(1).max(255).optional(),
    amount: amountSchema.optional(),
    sourceId: z.uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdatableField =
      data.name !== undefined ||
      data.amount !== undefined ||
      data.sourceId !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["incomeId"],
        message: "Provide at least one field to update",
      });
    }
  });

const listIncomesInput = paginationInputSchema.extend({});

const incomeIdInput = z.object({
  incomeId: z.uuid(),
});

const bulkDeleteInput = z.object({
  incomeIds: z.array(z.uuid()).min(1, "At least one income ID is required"),
});

const numericToNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type IncomeRow = {
  income: typeof import("../../db/schema/income.schema").income.$inferSelect;
  transaction: typeof import("../../db/schema/financial-transaction.schema").financialTransaction.$inferSelect;
  source: typeof import("../../db/schema/income.schema").incomeSource.$inferSelect | null;
};

const toIncomeDto = (row: IncomeRow) => ({
  ...row.income,
  transaction: row.transaction,
  source: row.source,
  amount: numericToNumber(row.transaction.amount),
  transactionDate: row.transaction.transactionDate,
});

export const incomeRouter = createTRPCRouter({
  listIncomes: protectedProcedure
    .input(listIncomesInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const filters = [eq(dbSchema.income.userId, user.id)];

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.income)
        .where(whereClause);

      const totalItems = Number(total?.count ?? 0);
      const { offset } = calculatePagination(input, totalItems);

      const rows = await db
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
        .where(whereClause)
        .orderBy(desc(dbSchema.financialTransaction.transactionDate))
        .limit(input.limit)
        .offset(offset);

      return {
        data: rows.map(toIncomeDto),
        meta: createPaginationMeta(input, totalItems),
      };
    }),

  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    const rows = await db
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
      .where(eq(dbSchema.income.userId, user.id));

    const allIncomes = rows.map((row) => ({
      income: row.income,
      amount: numericToNumber(row.transaction.amount),
      transactionDate: row.transaction.transactionDate,
      source: row.source,
    }));

    const expenseRows = await db
      .select({ transaction: dbSchema.financialTransaction })
      .from(dbSchema.expense)
      .innerJoin(
        dbSchema.financialTransaction,
        eq(dbSchema.expense.transactionId, dbSchema.financialTransaction.id),
      )
      .where(eq(dbSchema.expense.userId, user.id));

    const totalIncome = allIncomes.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    const totalExpenses = expenseRows.reduce(
      (sum, item) => sum + numericToNumber(item.transaction.amount),
      0,
    );

    const netIncome = totalIncome - totalExpenses;

    const monthlyData: Record<string, number> = {};
    allIncomes.forEach((item) => {
      const d = new Date(item.transactionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = (monthlyData[key] || 0) + item.amount;
    });

    const monthlyBreakdown = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, amount]) => {
        const [year, month] = key.split("-");
        const date = new Date(
          parseInt(year || "0"),
          parseInt(month || "0") - 1,
        );
        return {
          month: date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          amount,
          rawDate: key,
        };
      });

    const sourceMap = new Map<string, number>();
    allIncomes.forEach((item) => {
      const sourceName = item.source?.name || "Unspecified";
      const current = sourceMap.get(sourceName) || 0;
      sourceMap.set(sourceName, current + item.amount);
    });

    const sourceBreakdown = Array.from(sourceMap.entries())
      .map(([source, amount]) => ({
        source,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      netIncome,
      monthlyBreakdown,
      sourceBreakdown,
    };
  }),

  getIncomeById: protectedProcedure
    .input(incomeIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { incomeId } = input;

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
        .where(
          and(
            eq(dbSchema.income.id, incomeId),
            eq(dbSchema.income.userId, user.id),
          ),
        )
        .limit(1);

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Income not found" });
      }

      return toIncomeDto(row);
    }),

  createIncome: protectedProcedure
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
    }),

  updateIncome: protectedProcedure
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
    }),

  deleteIncome: protectedProcedure
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
            eq(
              dbSchema.financialTransaction.id,
              incomeExists.transactionId,
            ),
          );
      });

      return { success: true };
    }),

  deleteIncomes: protectedProcedure
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
      const transactionIds = existingIncomes.map((income) => income.transactionId);

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
    }),
});
