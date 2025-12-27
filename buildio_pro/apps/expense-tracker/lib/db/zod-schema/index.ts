import * as expensesSchema from "./expenses.zod.schema";
import * as incomeSchema from "./income.zod.schema";
import * as userExtendedSchema from "./user-extended.zod.schema";
import * as budgetSchema from "./budget.zod.schema";
import * as currencySchema from "./currency.zod.schema";
import * as paymentSchema from "./payment.zod.schema";
import * as bankSchema from "./bank.zod.schema";
import * as addressSchema from "./address.zod.schema";
import * as investmentSchema from "./investment.zod.schema";
import * as commonSchema from "./common.zod.schema";
import * as eventSchema from "./event.zod.schema";

export const zodSchema = {
  ...expensesSchema,
  ...incomeSchema,
  ...userExtendedSchema,
  ...budgetSchema,
  ...currencySchema,
  ...paymentSchema,
  ...bankSchema,
  ...addressSchema,
  ...investmentSchema,
  ...commonSchema,
  ...eventSchema,
};
