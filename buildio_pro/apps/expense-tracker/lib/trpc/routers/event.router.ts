import { createTRPCRouter } from "../init";
import {
  addExpenseToEvent,
  createEvent,
  deleteEvent,
  removeExpenseFromEvent,
  updateEvent,
} from "./event.mutations";
import {
  getEventById,
  getEventSpendingHistory,
  getUnlinkedExpenses,
  listEvents,
  listStatuses,
} from "./event.queries";

export const eventRouter = createTRPCRouter({
  listStatuses,
  listEvents,
  getEventById,
  getUnlinkedExpenses,
  createEvent,
  updateEvent,
  deleteEvent,
  addExpenseToEvent,
  removeExpenseFromEvent,
  getEventSpendingHistory,
});
