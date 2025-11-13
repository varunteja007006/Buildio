import { user, session, account, verification } from "./auth-schema";

import { userPreferences, userProfileRelations } from "./user-extended.schema";

import { bankAccountTypes, banks } from "./bank.schema";

import { expense, expenseCategory } from "./expenses.schema";

import { income, incomeSource } from "./income.schema";

import { address, city, country, state } from "./address.schema";

export const dbSchema = {
	user,
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
