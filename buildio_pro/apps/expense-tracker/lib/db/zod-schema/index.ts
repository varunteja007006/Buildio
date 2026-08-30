import * as addressSchema from "./address.zod.schema";
import * as bankSchema from "./bank.zod.schema";
import * as budgetSchema from "./budget.zod.schema";
import * as commonSchema from "./common.zod.schema";
import * as currencySchema from "./currency.zod.schema";
import * as eventSchema from "./event.zod.schema";
import * as expensesSchema from "./expenses.zod.schema";
import * as financialTransactionSchema from "./financial-transaction.zod.schema";
import * as incomeSchema from "./income.zod.schema";
import * as investmentSchema from "./investment.zod.schema";
import * as paymentSchema from "./payment.zod.schema";
import * as statementSchema from "./statement.zod.schema";
import * as transferSchema from "./transfer.zod.schema";
import * as userExtendedSchema from "./user-extended.zod.schema";

export const zodSchema = {
  ...expensesSchema,
  ...financialTransactionSchema,
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
  ...statementSchema,
  ...transferSchema,
};
