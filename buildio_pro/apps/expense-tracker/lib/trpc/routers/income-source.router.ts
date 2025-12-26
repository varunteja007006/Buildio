import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";

const createIncomeSourceInput = z.object({
  name: z.string().min(1, "Income source name is required").max(255),
  description: z.string().max(500).optional(),
});

const updateIncomeSourceInput = z
  .object({
    sourceId: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdatableField =
      data.name !== undefined || data.description !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["sourceId"],
        message: "Provide at least one field to update",
      });
    }
  });

const listIncomeSourcesInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

const sourceIdInput = z.object({
  sourceId: z.string().uuid(),
});

function numericToNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const incomeSourceRouter = createTRPCRouter({
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const { db, dbSchema, user } = ctx;

    // Get all income sources
    const sources = await db.query.incomeSource.findMany();

    // Get all incomes for the user
    const incomes = await db.query.income.findMany({
      where: eq(dbSchema.income.userId, user.id),
    });

    // Aggregate data
    const stats = new Map<string, { count: number; total: number }>();

    for (const inc of incomes) {
      if (!inc.sourceId) continue;
      const current = stats.get(inc.sourceId) || { count: 0, total: 0 };
      current.count += 1;
      current.total += numericToNumber(inc.incomeAmount);
      stats.set(inc.sourceId, current);
    }

    // Combine source info with stats
    const result = sources
      .map((source) => {
        const stat = stats.get(source.id) || { count: 0, total: 0 };
        return {
          id: source.id,
          name: source.name,
          count: stat.count,
          totalEarned: stat.total,
        };
      })
      .sort((a, b) => b.totalEarned - a.totalEarned); // Sort by total earned (Primary sources first)

    return result;
  }),

  listSources: protectedProcedure
    .input(listIncomeSourcesInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { limit, offset } = input;

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.incomeSource);

      const sources = await db.query.incomeSource.findMany({
        limit,
        offset,
        orderBy: (source, { asc }) => asc(source.name),
      });

      return {
        data: sources,
        meta: {
          limit,
          offset,
          totalItems: Number(total?.count ?? 0),
          hasMore: offset + limit < Number(total?.count ?? 0),
        },
      };
    }),

  getSourceById: protectedProcedure
    .input(sourceIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { sourceId } = input;

      const source = await db.query.incomeSource.findFirst({
        where: eq(dbSchema.incomeSource.id, sourceId),
        with: {
          incomes: true,
        },
      });

      if (!source) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Income source not found",
        });
      }

      return source;
    }),

  createSource: protectedProcedure
    .input(createIncomeSourceInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;

      const [source] = await db
        .insert(dbSchema.incomeSource)
        .values({
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return source;
    }),

  updateSource: protectedProcedure
    .input(updateIncomeSourceInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { sourceId, ...updates } = input;

      const existingSource = await db.query.incomeSource.findFirst({
        where: eq(dbSchema.incomeSource.id, sourceId),
      });

      if (!existingSource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Income source not found",
        });
      }
      
      const [updatedSource] = await db
        .update(dbSchema.incomeSource)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(dbSchema.incomeSource.id, sourceId))
        .returning();

      return updatedSource;
    }),

  deleteSource: protectedProcedure
    .input(sourceIdInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { sourceId } = input;

      const sourceExists = await db.query.incomeSource.findFirst({
        where: eq(dbSchema.incomeSource.id, sourceId),
      });

      if (!sourceExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Income source not found",
        });
      }

      // Check if source is in use
      const [linkedIncomes] = await db
        .select({ count: count() })
        .from(dbSchema.income)
        .where(eq(dbSchema.income.sourceId, sourceId));

      if (Number(linkedIncomes?.count ?? 0) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Cannot delete an income source that has linked income records",
        });
      }

      await db
        .delete(dbSchema.incomeSource)
        .where(eq(dbSchema.incomeSource.id, sourceId));

      return { success: true };
    }),
});
