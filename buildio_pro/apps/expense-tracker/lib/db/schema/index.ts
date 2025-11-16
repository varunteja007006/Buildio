import { address, city, country, state } from "./address.schema";
import { user, session, account, verification } from "./auth-schema";
import { bankAccountTypes, banks, bankAddress } from "./bank.schema";
import { budget } from "./budget.schema";
import { currency, currencyExchangeSnapshot } from "./currency.schema";
import { expense, expenseCategory } from "./expenses.schema";
import { income, incomeSource } from "./income.schema";
import { investmentPlatforms, investmentTypes } from "./investment.schema";
import { paymentMethods, paymentProvider } from "./payment.schema";
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
	investmentPlatforms,
	investmentTypes,
	bankAddress,
	budget,
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
	income,
	incomeSource,
	address,
	city,
	country,
	state,
};
