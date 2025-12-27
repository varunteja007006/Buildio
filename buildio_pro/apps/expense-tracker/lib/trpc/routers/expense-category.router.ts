import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";
import {
  paginationInputSchema,
  calculatePagination,
  createPaginationMeta,
} from "../schemas/pagination.schema";

import { zodSchema } from "@/lib/db/zod-schema";

const createCategoryInput = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().max(500).optional(),
});

const updateCategoryInput = z
  .object({
    categoryId: z.uuid(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const hasUpdatableField =
      data.name !== undefined || data.description !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Provide at least one field to update",
      });
    }
  });

const categoryIdInput = z.object({
  categoryId: z.uuid(),
});

export const expenseCategoryRouter = createTRPCRouter({
  listCategories: protectedProcedure
    .input(paginationInputSchema)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.expenseCategory);

      const totalItems = Number(total?.count ?? 0);
      const { offset } = calculatePagination(input, totalItems);

      const categories = await db.query.expenseCategory.findMany({
        limit: input.limit,
        offset,
        orderBy: (category, { asc }) => asc(category.name),
      });

      return {
        data: categories,
        meta: createPaginationMeta(input, totalItems),
      };
    }),

  getCategoryById: protectedProcedure
    .input(categoryIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { categoryId } = input;

      const category = await db.query.expenseCategory.findFirst({
        where: eq(dbSchema.expenseCategory.id, categoryId),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  createCategory: protectedProcedure
    .input(createCategoryInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;

      const [category] = await db
        .insert(dbSchema.expenseCategory)
        .values({
          name: input.name,
          description: input.description || "",
        })
        .returning();

      return category;
    }),

  updateCategory: protectedProcedure
    .input(updateCategoryInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { categoryId, ...updates } = input;

      const existingCategory = await db.query.expenseCategory.findFirst({
        where: eq(dbSchema.expenseCategory.id, categoryId),
      });

      if (!existingCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.description !== undefined
          ? { description: updates.description }
          : {}),
        updatedAt: new Date(),
      };

      const [updatedCategory] = await db
        .update(dbSchema.expenseCategory)
        .set(payload)
        .where(eq(dbSchema.expenseCategory.id, categoryId))
        .returning();

      return updatedCategory;
    }),

  deleteCategory: protectedProcedure
    .input(categoryIdInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { categoryId } = input;

      const categoryExists = await db.query.expenseCategory.findFirst({
        where: eq(dbSchema.expenseCategory.id, categoryId),
      });

      if (!categoryExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Check if category is in use
      const [linkedExpenses] = await db
        .select({ count: count() })
        .from(dbSchema.expense)
        .where(eq(dbSchema.expense.categoryId, categoryId));

      if (Number(linkedExpenses?.count ?? 0) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a category that has linked expenses",
        });
      }

      await db
        .delete(dbSchema.expenseCategory)
        .where(eq(dbSchema.expenseCategory.id, categoryId));

      return { success: true };
    }),
});
