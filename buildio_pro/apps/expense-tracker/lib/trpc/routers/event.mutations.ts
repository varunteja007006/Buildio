import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { protectedProcedure } from "../init";
import {
  addExpenseToEventInput,
  createEventInput,
  eventIdInput,
  removeExpenseFromEventInput,
  updateEventInput,
} from "./event.schemas";

export const createEvent = protectedProcedure
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
  });

export const updateEvent = protectedProcedure
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
  });

export const deleteEvent = protectedProcedure
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
  });

export const addExpenseToEvent = protectedProcedure
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
  });

export const removeExpenseFromEvent = protectedProcedure
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
  });
