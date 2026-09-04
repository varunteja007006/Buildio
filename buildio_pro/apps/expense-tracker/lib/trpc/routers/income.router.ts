import { createTRPCRouter } from "../init";
import {
  createIncome,
  deleteIncome,
  deleteIncomes,
  updateIncome,
} from "./income.mutations";
import { getAnalytics, getIncomeById, listIncomes } from "./income.queries";

export const incomeRouter = createTRPCRouter({
  listIncomes,
  getAnalytics,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  deleteIncomes,
});
