import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { event } from "../schema/event.schema";

export const createEventSchema = createInsertSchema(event)
  .omit({
    userId: true,
  })
  .extend({
    statusId: z.uuid().optional(),
  });

export const updateEventSchema = createUpdateSchema(event).omit({
  userId: true,
});

export const selectEventSchema = createSelectSchema(event);

export const eventIdInput = z.object({
  eventId: z.uuid(),
});

export const listEventsInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  statusId: z.uuid().optional(),
});

export const addExpenseToEventInput = z.object({
  eventId: z.uuid(),
  expenseId: z.uuid(),
});

export const removeExpenseFromEventInput = z.object({
  eventId: z.uuid(),
  expenseId: z.uuid(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type SelectEventInput = z.infer<typeof selectEventSchema>;
export type EventIdInput = z.infer<typeof eventIdInput>;
export type ListEventsInput = z.infer<typeof listEventsInput>;
export type AddExpenseToEventInput = z.infer<typeof addExpenseToEventInput>;
export type RemoveExpenseFromEventInput = z.infer<
  typeof removeExpenseFromEventInput
>;
