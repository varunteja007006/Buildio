import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  currency,
  currencyExchangeSnapshot,
} from "../schema/currency.schema";

export const createCurrencySchema = createInsertSchema(currency);
export const updateCurrencySchema = createUpdateSchema(currency);
export const selectCurrencySchema = createSelectSchema(currency);

export const createCurrencyExchangeSnapshotSchema = createInsertSchema(
  currencyExchangeSnapshot,
).omit({
  currencyId: true,
});

export const updateCurrencyExchangeSnapshotSchema = createUpdateSchema(
  currencyExchangeSnapshot,
).omit({
  currencyId: true,
});

export const selectCurrencyExchangeSnapshotSchema =
  createSelectSchema(currencyExchangeSnapshot);
