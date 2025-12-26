import { address, city, country, state } from "./address.schema";
import { user, session, account, verification } from "./auth-schema";
import { bankAccountTypes, banks, bankAddress } from "./bank.schema";
import { budget, budgetRelations } from "./budget.schema";
import { currency, currencyExchangeSnapshot } from "./currency.schema";
import {
  expense,
  expenseCategory,
  expenseRelations,
  expenseCategoryRelations,
} from "./expenses.schema";
import {
  income,
  incomeSource,
  incomeRelations,
  incomeSourceRelations,
} from "./income.schema";
import { investmentPlatforms, investmentTypes } from "./investment.schema";
import {
  paymentMethods,
  paymentProvider,
  paymentProviderRelations,
  paymentMethodsRelations,
} from "./payment.schema";
import {
  event,
  eventExpense,
  eventRelations,
  eventExpenseRelations,
  eventStatus,
} from "./event.schema";
import {
  userPreferences,
  userProfileRelations,
  userBankAccount,
  userProfile,
  userSettings,
} from "./user-extended.schema";

export const dbSchema = {
  paymentMethods,
  paymentProvider,
  paymentProviderRelations,
  paymentMethodsRelations,
  investmentPlatforms,
  investmentTypes,
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
  event,
  eventStatus,
  eventExpense,
  eventRelations,
  eventExpenseRelations,
  address,
  city,
  country,
  state,
};
