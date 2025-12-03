import { eq } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "../init";

import { zodSchema } from "@/lib/db/zod-schema";

import z from "zod";

export const budgetRouter = createTRPCRouter({
	budgetList: protectedProcedure
		.input(
			z.object({
				limit: z
					.number()
					.default(10)
					.refine((val) => val > 0 && val <= 100),
				offset: z
					.number()
					.default(0)
					.refine((val) => val >= 0),
			})
		)
		.query(async ({ input, ctx }) => {
			const { db, dbSchema, user } = ctx;
			const { limit, offset } = input;

			const budgetList = await db.query.budget.findMany({
				limit,
				offset,
				where: eq(dbSchema.budget.userId, user.id),
			});

			return budgetList;
		}),

	createBudget: protectedProcedure
		.input(zodSchema.createBudgetSchema)
		.mutation(async ({ input, ctx }) => {
			const { db, dbSchema, user } = ctx;
			await db.insert(dbSchema.budget).values({
				name: "Test Budget",
				description: "Test description",
				budgetAmount: "1000",
				endMonth: new Date(),
				startMonth: new Date(),
				userId: user.id,
			});
		}),
});
