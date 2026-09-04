import { createTRPCRouter } from "../init";
import { createExpense } from "./expense.create";
import {
  deleteExpense,
  deleteExpenses,
  updateExpense,
} from "./expense.mutations";
import { getAnalytics, getExpenseById, listExpenses } from "./expense.queries";

export const expenseRouter = createTRPCRouter({
  listExpenses,
  getAnalytics,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  deleteExpenses,
});
