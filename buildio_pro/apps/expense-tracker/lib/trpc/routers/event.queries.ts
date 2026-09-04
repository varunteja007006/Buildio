import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  eventIdInput,
  listEventsInput,
  numericToNumber,
} from "./event.schemas";
import {
  calculatePagination,
  createPaginationMeta,
} from "../schemas/pagination.schema";

export const listStatuses = protectedProcedure.query(async ({ ctx }) => {
  return ctx.db.query.eventStatus.findMany({
    orderBy: (status) => asc(status.sortOrder),
  });
});

export const listEvents = protectedProcedure
  .input(listEventsInput)
  .query(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { statusId } = input;

    const filters = [eq(dbSchema.event.userId, user.id)];

    if (statusId) {
      filters.push(eq(dbSchema.event.statusId, statusId));
    }

    const whereClause = filters.length === 1 ? filters[0] : and(...filters);

    const [total] = await db
      .select({ count: count() })
      .from(dbSchema.event)
      .where(whereClause);

    const totalItems = Number(total?.count ?? 0);
    const { offset } = calculatePagination(input, totalItems);

    const events = await db.query.event.findMany({
      limit: input.limit,
      offset,
      where: whereClause,
      with: {
        status: true,
        expenses: {
          with: {
            expense: {
              with: {
                transaction: true,
              },
            },
          },
        },
      },
      orderBy: (event) => desc(event.createdAt),
    });

    const eventsWithTotals = events.map((evt) => {
      const totalSpent = evt.expenses.reduce(
        (sum, ee) => sum + numericToNumber(ee.expense.transaction?.amount),
        0,
      );
      return {
        ...evt,
        totalSpent,
        estimatedBudget: numericToNumber(evt.estimatedBudget),
        remaining: numericToNumber(evt.estimatedBudget) - totalSpent,
      };
    });

    return {
      data: eventsWithTotals,
      meta: createPaginationMeta(input, totalItems),
    };
  });

export const getEventById = protectedProcedure
  .input(eventIdInput)
  .query(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { eventId } = input;

    const evt = await db.query.event.findFirst({
      where: and(
        eq(dbSchema.event.id, eventId),
        eq(dbSchema.event.userId, user.id),
      ),
      with: {
        status: true,
        expenses: {
          with: {
            expense: {
              with: {
                category: true,
                transaction: true,
              },
            },
          },
        },
      },
    });

    if (!evt) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found",
      });
    }

    const totalSpent = evt.expenses.reduce(
      (sum, ee) => sum + numericToNumber(ee.expense.transaction?.amount),
      0,
    );

    return {
      ...evt,
      totalSpent,
      estimatedBudget: numericToNumber(evt.estimatedBudget),
      remaining: numericToNumber(evt.estimatedBudget) - totalSpent,
    };
  });

export const getUnlinkedExpenses = protectedProcedure
  .input(eventIdInput)
  .query(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { eventId } = input;

    // Get all linked expense IDs for this event
    const linkedExpenses = await db.query.eventExpense.findMany({
      where: eq(dbSchema.eventExpense.eventId, eventId),
    });

    const linkedExpenseIds = linkedExpenses.map((ee) => ee.expenseId);

    // Get all expenses for user
    const allExpenses = await db.query.expense.findMany({
      where: eq(dbSchema.expense.userId, user.id),
      with: {
        category: true,
        transaction: true,
      },
      limit: 100,
    });

    // Filter out linked expenses
    return allExpenses.filter((exp) => !linkedExpenseIds.includes(exp.id));
  });

export const getEventSpendingHistory = protectedProcedure
  .input(eventIdInput)
  .query(async ({ input, ctx }) => {
    const { db, dbSchema, user } = ctx;
    const { eventId } = input;

    // Verify event exists and belongs to user
    const evt = await db.query.event.findFirst({
      where: and(
        eq(dbSchema.event.id, eventId),
        eq(dbSchema.event.userId, user.id),
      ),
    });

    if (!evt) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found",
      });
    }

    // Get all expenses linked to this event
    const linkedExpenses = await db.query.eventExpense.findMany({
      where: eq(dbSchema.eventExpense.eventId, eventId),
      with: {
        expense: {
          with: {
            transaction: true,
          },
        },
      },
    });

    // Group by month
    const historyMap = new Map<string, number>();

    for (const item of linkedExpenses) {
      const expense = item.expense;
      if (!expense.transaction) continue;

      const date = new Date(expense.transaction.transactionDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      historyMap.set(
        key,
        (historyMap.get(key) || 0) +
          numericToNumber(expense.transaction.amount),
      );
    }

    // Convert to array and sort
    const history = Array.from(historyMap.entries())
      .map(([date, amount]) => ({
        date,
        amount,
        label: new Date(date + "-01").toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return history;
  });
