import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";

import { zodSchema } from "@/lib/db/zod-schema";

const createCategoryInput = z.object({
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().max(500).optional(),
});

const updateCategoryInput = z
  .object({
    categoryId: z.string().uuid(),
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

const listCategoriesInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

const categoryIdInput = z.object({
  categoryId: z.string().uuid(),
});

export const expenseCategoryRouter = createTRPCRouter({
  listCategories: protectedProcedure
    .input(listCategoriesInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema } = ctx;
      const { limit, offset } = input;

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.expenseCategory);

      const categories = await db.query.expenseCategory.findMany({
        limit,
        offset,
        orderBy: (category, { asc }) => asc(category.name),
      });

      return {
        data: categories,
        meta: {
          limit,
          offset,
          totalItems: Number(total?.count ?? 0),
          hasMore: offset + limit < Number(total?.count ?? 0),
        },
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
