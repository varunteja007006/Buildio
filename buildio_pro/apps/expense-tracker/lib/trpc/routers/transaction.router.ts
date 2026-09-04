import { createTRPCRouter } from "../init";
import { getAnalytics } from "./transaction.analytics";
import {
  confirmTransaction,
  deleteTransaction,
  deleteTransactions,
  runEnrichment,
  updateTransaction,
} from "./transaction.mutations";
import {
  getTransactionById,
  listBankAccounts,
  listByStatement,
  listPaymentMethods,
  listTransactions,
} from "./transaction.queries";

export const transactionRouter = createTRPCRouter({
  listTransactions,
  getTransactionById,
  getAnalytics,
  listByStatement,
  runEnrichment,
  listPaymentMethods,
  listBankAccounts,
  updateTransaction,
  deleteTransaction,
  deleteTransactions,
  confirmTransaction,
});
