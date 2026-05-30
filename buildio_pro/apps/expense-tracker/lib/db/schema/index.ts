import { address, city, country, state } from "./address.schema";
import { account, session, user, verification } from "./auth-schema";
import { bankAccountTypes, bankAddress, banks } from "./bank.schema";
import { budget, budgetRelations } from "./budget.schema";
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
  expenseCategory,
  expenseCategoryRelations,
  expenseRelations,
} from "./expenses.schema";
import {
  income,
  incomeRelations,
  incomeSource,
  incomeSourceRelations,
} from "./income.schema";
import { investmentPlatforms, investmentTypes } from "./investment.schema";
import {
  paymentMethods,
  paymentMethodsRelations,
  paymentProvider,
  paymentProviderRelations,
} from "./payment.schema";
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
