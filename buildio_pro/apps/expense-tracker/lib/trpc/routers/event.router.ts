import { and, count, eq, desc, asc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { zodSchema } from "@/lib/db/zod-schema";

const estimatedBudgetSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value.toString() : value.trim(),
  )
  .refine((val) => !val || Number(val) >= 0, {
    message: "Estimated budget must be a positive number",
  })
  .optional();

const createEventInput = z
  .object({
    name: zodSchema.createEventSchema.shape.name,
    description: zodSchema.createEventSchema.shape.description,
    estimatedBudget: estimatedBudgetSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    statusId: zodSchema.createEventSchema.shape.statusId,
  })
  .superRefine((data, ctx) => {
    if (data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  });

const updateEventInput = z
  .object({
    eventId: z.string().uuid(),
    name: zodSchema.updateEventSchema.shape.name,
    description: zodSchema.updateEventSchema.shape.description,
    estimatedBudget: estimatedBudgetSchema,
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    statusId: zodSchema.createEventSchema.shape.statusId,
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }

    const hasUpdatableField =
      data.name !== undefined ||
      data.description !== undefined ||
      data.estimatedBudget !== undefined ||
      data.startDate !== undefined ||
      data.endDate !== undefined ||
      data.statusId !== undefined;

    if (!hasUpdatableField) {
      ctx.addIssue({
        code: "custom",
        path: ["eventId"],
        message: "Provide at least one field to update",
      });
    }
  });

const listEventsInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  statusId: z.string().uuid().optional(),
});

const eventIdInput = z.object({
  eventId: z.string().uuid(),
});

const addExpenseToEventInput = z.object({
  eventId: z.string().uuid(),
  expenseId: z.string().uuid(),
});

const removeExpenseFromEventInput = z.object({
  eventId: z.string().uuid(),
  expenseId: z.string().uuid(),
});

function numericToNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const eventRouter = createTRPCRouter({
  listStatuses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.eventStatus.findMany({
      orderBy: (status: any) => asc(status.sortOrder),
    });
  }),

  listEvents: protectedProcedure
    .input(listEventsInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { limit, offset, statusId } = input;

      const filters = [eq(dbSchema.event.userId, user.id)];

      if (statusId) {
        filters.push(eq(dbSchema.event.statusId, statusId));
      }

      const whereClause = filters.length === 1 ? filters[0] : and(...filters);

      const [total] = await db
        .select({ count: count() })
        .from(dbSchema.event)
        .where(whereClause);

      const events = await db.query.event.findMany({
        limit,
        offset,
        where: whereClause,
        with: {
          status: true,
          expenses: {
            with: {
              expense: true,
            },
          },
        },
        orderBy: (event: any) => desc(event.createdAt),
      });

      const eventsWithTotals = events.map((evt: any) => {
        const totalSpent = evt.expenses.reduce(
          (sum: number, ee: any) =>
            sum + numericToNumber(ee.expense.expenseAmount),
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
        meta: {
          limit,
          offset,
          totalItems: Number(total?.count ?? 0),
          hasMore: offset + limit < Number(total?.count ?? 0),
        },
      };
    }),

  getEventById: protectedProcedure
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
        (sum: number, ee: any) =>
          sum + numericToNumber(ee.expense.expenseAmount),
        0,
      );

      return {
        ...evt,
        totalSpent,
        estimatedBudget: numericToNumber(evt.estimatedBudget),
        remaining: numericToNumber(evt.estimatedBudget) - totalSpent,
      };
    }),

  getUnlinkedExpenses: protectedProcedure
    .input(eventIdInput)
    .query(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { eventId } = input;

      // Get all linked expense IDs for this event
      const linkedExpenses = await db.query.eventExpense.findMany({
        where: eq(dbSchema.eventExpense.eventId, eventId),
      });

      const linkedExpenseIds = linkedExpenses.map((ee: any) => ee.expenseId);

      // Get all expenses for user
      const allExpenses = await db.query.expense.findMany({
        where: eq(dbSchema.expense.userId, user.id),
        with: {
          category: true,
        },
        limit: 100,
      });

      // Filter out linked expenses
      return allExpenses.filter(
        (exp: any) => !linkedExpenseIds.includes(exp.id),
      );
    }),

  createEvent: protectedProcedure
    .input(createEventInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;

      const [eventRecord] = await db
        .insert(dbSchema.event)
        .values({
          ...input,
          statusId: input.statusId,
          estimatedBudget: input.estimatedBudget || null,
          endDate: input.endDate || null,
          userId: user.id,
        })
        .returning();

      return eventRecord;
    }),

  updateEvent: protectedProcedure
    .input(updateEventInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { eventId, ...updates } = input;

      const existingEvent = await db.query.event.findFirst({
        where: and(
          eq(dbSchema.event.id, eventId),
          eq(dbSchema.event.userId, user.id),
        ),
      });

      if (!existingEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      const payload = {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.description !== undefined
          ? { description: updates.description }
          : {}),
        ...(updates.estimatedBudget !== undefined
          ? { estimatedBudget: updates.estimatedBudget }
          : {}),
        ...(updates.startDate !== undefined
          ? { startDate: updates.startDate }
          : {}),
        ...(updates.endDate !== undefined ? { endDate: updates.endDate } : {}),
        ...(updates.statusId !== undefined
          ? { statusId: updates.statusId }
          : {}),
        updatedAt: new Date(),
      };

      const [updatedEvent] = await db
        .update(dbSchema.event)
        .set(payload)
        .where(
          and(
            eq(dbSchema.event.id, eventId),
            eq(dbSchema.event.userId, user.id),
          ),
        )
        .returning();

      return updatedEvent;
    }),

  deleteEvent: protectedProcedure
    .input(eventIdInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { eventId } = input;

      const existingEvent = await db.query.event.findFirst({
        where: and(
          eq(dbSchema.event.id, eventId),
          eq(dbSchema.event.userId, user.id),
        ),
      });

      if (!existingEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      await db
        .delete(dbSchema.event)
        .where(
          and(
            eq(dbSchema.event.id, eventId),
            eq(dbSchema.event.userId, user.id),
          ),
        );

      return { success: true };
    }),

  addExpenseToEvent: protectedProcedure
    .input(addExpenseToEventInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { eventId, expenseId } = input;

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

      // Verify expense exists and belongs to user
      const expenseRecord = await db.query.expense.findFirst({
        where: and(
          eq(dbSchema.expense.id, expenseId),
          eq(dbSchema.expense.userId, user.id),
        ),
      });

      if (!expenseRecord) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      // Check if already linked
      const existing = await db.query.eventExpense.findFirst({
        where: and(
          eq(dbSchema.eventExpense.eventId, eventId),
          eq(dbSchema.eventExpense.expenseId, expenseId),
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expense is already linked to this event",
        });
      }

      const [eventExpenseRecord] = await db
        .insert(dbSchema.eventExpense)
        .values({
          eventId,
          expenseId,
        })
        .returning();

      return eventExpenseRecord;
    }),

  removeExpenseFromEvent: protectedProcedure
    .input(removeExpenseFromEventInput)
    .mutation(async ({ input, ctx }) => {
      const { db, dbSchema, user } = ctx;
      const { eventId, expenseId } = input;

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

      const existing = await db.query.eventExpense.findFirst({
        where: and(
          eq(dbSchema.eventExpense.eventId, eventId),
          eq(dbSchema.eventExpense.expenseId, expenseId),
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense is not linked to this event",
        });
      }

      await db
        .delete(dbSchema.eventExpense)
        .where(
          and(
            eq(dbSchema.eventExpense.eventId, eventId),
            eq(dbSchema.eventExpense.expenseId, expenseId),
          ),
        );

      return { success: true };
    }),

  getEventSpendingHistory: protectedProcedure
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
          expense: true,
        },
      });

      // Group by month
      const historyMap = new Map<string, number>();

      for (const item of linkedExpenses) {
        const expense = item.expense;
        if (!expense.createdAt) continue;

        const date = new Date(expense.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        
        // Fix: Map set key/value order was swapped in my thought process, correcting it now
        historyMap.set(key, (historyMap.get(key) || 0) + numericToNumber(expense.expenseAmount));
      }

      // Convert to array and sort
      const history = Array.from(historyMap.entries())
        .map(([date, amount]) => ({
          date,
          amount,
          label: new Date(date + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return history;
    }),
});
