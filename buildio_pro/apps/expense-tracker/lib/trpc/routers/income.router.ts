import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";
import {
  paginationInputSchema,
  calculatePagination,
  createPaginationMeta,
} from "../schemas/pagination.schema";

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
  sourceId: z.uuid().optional(),
  paymentMethodId: z.uuid().optional(),
});

const updateIncomeInput = z
  .object({
    incomeId: z.uuid(),
    name: z.string().min(1).max(255).optional(),
    incomeAmount: incomeAmountSchema.optional(),
    sourceId: z.uuid().nullable().optional(),
    paymentMethodId: z.uuid().nullable().optional(),
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

const listIncomesInput = paginationInputSchema.extend({});

const incomeIdInput = z.object({
  incomeId: z.uuid(),
});

const bulkDeleteInput = z.object({
  incomeIds: z.array(z.uuid()).min(1, "At least one income ID is required"),
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

      const filters = [eq(dbSchema.income.userId, user.id)];

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.income)
        .where(whereClause);

      const totalItems = Number(total?.count ?? 0);
      const { offset } = calculatePagination(input, totalItems);

      const incomes = await db.query.income.findMany({
        limit: input.limit,
        offset,
        where: whereClause,
        with: {
          source: true,
          paymentMethod: true,
        },
        orderBy: (income, { desc }) => {
          return desc(income.createdAt);
        },
      });

      return {
        data: incomes,
        meta: createPaginationMeta(input, totalItems),
      };
    }),

  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    // Fetch all income
    const allIncomes = await db.query.income.findMany({
      where: eq(dbSchema.income.userId, user.id),
      with: {
        source: true,
      },
      orderBy: (income, { asc }) => asc(income.createdAt),
    });

    // Fetch all expenses for Net Income calculation
    const allExpenses = await db
      .select({ amount: dbSchema.expense.expenseAmount })
      .from(dbSchema.expense)
      .where(eq(dbSchema.expense.userId, user.id));

    const totalIncome = allIncomes.reduce(
      (sum, item) => sum + numericToNumber(item.incomeAmount),
      0,
    );

    const totalExpenses = allExpenses.reduce(
      (sum, item) => sum + numericToNumber(item.amount),
      0,
    );

    const netIncome = totalIncome - totalExpenses;

    // Monthly Breakdown
    const monthlyData: Record<string, number> = {};
    allIncomes.forEach((item) => {
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] =
        (monthlyData[key] || 0) + numericToNumber(item.incomeAmount);
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

    // Source Breakdown
    const sourceMap = new Map<string, number>();
    allIncomes.forEach((item) => {
      const sourceName = item.source?.name || "Unspecified";
      const current = sourceMap.get(sourceName) || 0;
      sourceMap.set(sourceName, current + numericToNumber(item.incomeAmount));
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
        ...updates,
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
