import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { paymentProvider, paymentMethods } from "../schema/payment.schema";

export const createPaymentProviderSchema = createInsertSchema(paymentProvider);
export const updatePaymentProviderSchema = createUpdateSchema(paymentProvider);
export const selectPaymentProviderSchema = createSelectSchema(paymentProvider);

export const createPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  paymentProviderId: true,
});

export const updatePaymentMethodSchema = createUpdateSchema(paymentMethods).omit({
  paymentProviderId: true,
});

export const selectPaymentMethodSchema = createSelectSchema(paymentMethods);
