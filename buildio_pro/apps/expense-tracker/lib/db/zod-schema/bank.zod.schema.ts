import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { bankAccountTypes, banks, bankAddress } from "../schema/bank.schema";

export const createBankAccountTypeSchema = createInsertSchema(bankAccountTypes);
export const updateBankAccountTypeSchema = createUpdateSchema(bankAccountTypes);
export const selectBankAccountTypeSchema = createSelectSchema(bankAccountTypes);

export const createBankSchema = createInsertSchema(banks);
export const updateBankSchema = createUpdateSchema(banks);
export const selectBankSchema = createSelectSchema(banks);

export const createBankAddressSchema = createInsertSchema(bankAddress).omit({
  bankId: true,
  addressId: true,
});

export const updateBankAddressSchema = createUpdateSchema(bankAddress).omit({
  bankId: true,
  addressId: true,
});

export const selectBankAddressSchema = createSelectSchema(bankAddress);
