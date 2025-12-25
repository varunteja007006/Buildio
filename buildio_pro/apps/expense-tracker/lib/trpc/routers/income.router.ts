import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";

import { zodSchema } from "@/lib/db/zod-schema";

const incomeAmountSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((value) => Number(value) > 0, {
    message: "Income amount must be greater than zero",
  });

const createIncomeInput = z.object({
  name: z.string().min(1, "Income name required").max(255),
  incomeAmount: incomeAmountSchema,
  sourceId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
});

const updateIncomeInput = z
  .object({
    incomeId: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
    incomeAmount: incomeAmountSchema.optional(),
    sourceId: z.string().uuid().nullable().optional(),
    paymentMethodId: z.string().uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdatableField =
      data.name !== undefined ||
      data.incomeAmount !== undefined ||
      data.sourceId !== undefined ||
      data.paymentMethodId !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["incomeId"],
        message: "Provide at least one field to update",
      });
    }
  });

const listIncomesInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  sourceId: z.string().uuid().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const incomeIdInput = z.object({
  incomeId: z.string().uuid(),
});

const numericToNumber = (value: string | number | null) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const incomeRouter = createTRPCRouter({
  listIncomes: protectedProcedure
    .input(listIncomesInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { limit, offset, sourceId, sortBy, sortOrder } = input;

      const filters = [eq(dbSchema.income.userId, user.id)];

      if (sourceId) {
        filters.push(eq(dbSchema.income.sourceId, sourceId));
      }

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.income)
        .where(whereClause);

      const incomes = await db.query.income.findMany({
        limit,
        offset,
        where: whereClause,
        with: {
          source: true,
          paymentMethod: true,
        },
        orderBy: (income, { asc, desc }) => {
          const order = sortOrder === "asc" ? asc : desc;
          return sortBy === "amount"
            ? order(income.incomeAmount)
            : order(income.createdAt);
        },
      });

      return {
        data: incomes,
        meta: {
          limit,
          offset,
          totalItems: Number(total?.count ?? 0),
          hasMore: offset + limit < Number(total?.count ?? 0),
        },
      };
    }),

  getIncomeById: protectedProcedure
    .input(incomeIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { incomeId } = input;

      const income = await db.query.income.findFirst({
        where: and(
          eq(dbSchema.income.id, incomeId),
          eq(dbSchema.income.userId, user.id),
        ),
        with: {
          source: true,
          paymentMethod: true,
        },
      });

      if (!income) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Income not found" });
      }

      return income;
    }),

  createIncome: protectedProcedure
    .input(createIncomeInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      // Validate source exists if provided
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

      // Validate payment method exists if provided
      if (input.paymentMethodId) {
        const paymentMethodExists = await db.query.paymentMethods.findFirst({
          where: eq(dbSchema.paymentMethods.id, input.paymentMethodId),
        });

        if (!paymentMethodExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Payment method not found",
          });
        }
      }

      const [incomeRecord] = await db
        .insert(dbSchema.income)
        .values({
          ...input,
          incomeAmount: input.incomeAmount,
          userId: user.id,
        })
        .returning();

      return incomeRecord;
    }),

  updateIncome: protectedProcedure
    .input(updateIncomeInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { incomeId, ...updates } = input;

      // Verify income exists and belongs to user
      const existingIncome = await db.query.income.findFirst({
        where: and(
          eq(dbSchema.income.id, incomeId),
          eq(dbSchema.income.userId, user.id),
        ),
      });

      if (!existingIncome) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Income not found" });
      }

      // Validate source exists if updating
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

      // Validate payment method exists if updating
      if (
        updates.paymentMethodId !== undefined &&
        updates.paymentMethodId !== null
      ) {
        const paymentMethodExists = await db.query.paymentMethods.findFirst({
          where: eq(dbSchema.paymentMethods.id, updates.paymentMethodId),
        });

        if (!paymentMethodExists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Payment method not found",
          });
        }
      }

      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.incomeAmount !== undefined
          ? { incomeAmount: updates.incomeAmount }
          : {}),
        ...(updates.sourceId !== undefined
          ? { sourceId: updates.sourceId }
          : {}),
        ...(updates.paymentMethodId !== undefined
          ? { paymentMethodId: updates.paymentMethodId }
          : {}),
        updatedAt: new Date(),
      };

      const [updatedIncome] = await db
        .update(dbSchema.income)
        .set(payload)
        .where(
          and(
            eq(dbSchema.income.id, incomeId),
            eq(dbSchema.income.userId, user.id),
          ),
        )
        .returning();

      return updatedIncome;
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

      await db
        .delete(dbSchema.income)
        .where(
          and(
            eq(dbSchema.income.id, incomeId),
            eq(dbSchema.income.userId, user.id),
          ),
        );

      return { success: true };
    }),
});
