import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";

import { zodSchema } from "@/lib/db/zod-schema";

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

export const incomeSourceRouter = createTRPCRouter({
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
          name: input.name,
          description: input.description || null,
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

      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.description !== undefined
          ? { description: updates.description }
          : {}),
        updatedAt: new Date(),
      };

      const [updatedSource] = await db
        .update(dbSchema.incomeSource)
        .set(payload)
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
