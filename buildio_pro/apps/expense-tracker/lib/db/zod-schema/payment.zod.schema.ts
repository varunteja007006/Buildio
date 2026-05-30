import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { paymentMethods, paymentProvider } from "../schema/payment.schema";

export const createPaymentProviderSchema = createInsertSchema(paymentProvider);
export const updatePaymentProviderSchema = createUpdateSchema(paymentProvider);
export const selectPaymentProviderSchema = createSelectSchema(paymentProvider);

export const createPaymentMethodSchema = createInsertSchema(
  paymentMethods,
).omit({
  paymentProviderId: true,
});

export const updatePaymentMethodSchema = createUpdateSchema(
  paymentMethods,
).omit({
  paymentProviderId: true,
});

export const selectPaymentMethodSchema = createSelectSchema(paymentMethods);
