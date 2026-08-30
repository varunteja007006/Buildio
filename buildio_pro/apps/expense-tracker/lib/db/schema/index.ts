import { address, city, country, state } from "./address.schema";
import { account, session, user, verification } from "./auth-schema";
import { bankAccountTypes, bankAddress, banks } from "./bank.schema";
import { budget, budgetRelations } from "./budget.schema";
import { expenseCategory, expenseCategoryRelations } from "./categories.schema";
import { currency, currencyExchangeSnapshot } from "./currency.schema";
import {
  event,
  eventExpense,
  eventExpenseRelations,
  eventRelations,
  eventStatus,
} from "./event.schema";
import {
  expense,
  expenseRelations,
} from "./expenses.schema";
import {
  financialTransaction,
  financialTransactionRelations,
  transactionDirection,
  transactionType,
} from "./financial-transaction.schema";
import {
  income,
  incomeRelations,
  incomeSource,
  incomeSourceRelations,
} from "./income.schema";
import {
  investmentPlatforms,
  investmentTransaction,
  investmentTransactionRelations,
  investmentTypes,
} from "./investment.schema";
import { paymentMethods, paymentMethodsRelations, paymentProvider, paymentProviderRelations } from "./payment.schema";
import {
  statementDocumentType,
  statementUpload,
  statementUploadRelations,
  statementUploadStatus,
} from "./statement.schema";
import {
  transactionTransfer,
  transactionTransferRelations,
} from "./transfer.schema";
import {
  userBankAccount,
  userPreferences,
  userProfile,
  userProfileRelations,
  userSettings,
} from "./user-extended.schema";

export const dbSchema = {
  paymentMethods,
  paymentProvider,
  paymentProviderRelations,
  paymentMethodsRelations,
  investmentPlatforms,
  investmentTypes,
  investmentTransaction,
  investmentTransactionRelations,
  bankAddress,
  budget,
  budgetRelations,
  currency,
  currencyExchangeSnapshot,
  user,
  userBankAccount,
  userProfile,
  userSettings,
  session,
  account,
  verification,
  userPreferences,
  userProfileRelations,
  bankAccountTypes,
  banks,
  expense,
  expenseCategory,
  expenseRelations,
  expenseCategoryRelations,
  income,
  incomeSource,
  incomeRelations,
  incomeSourceRelations,
  transactionDirection,
  transactionType,
  financialTransaction,
  financialTransactionRelations,
  transactionTransfer,
  transactionTransferRelations,
  event,
  eventStatus,
  eventExpense,
  eventRelations,
  eventExpenseRelations,
  statementDocumentType,
  statementUpload,
  statementUploadRelations,
  statementUploadStatus,
  address,
  city,
  country,
  state,
};
