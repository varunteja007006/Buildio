import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { country, state, city, address } from "../schema/address.schema";

export const createCountrySchema = createInsertSchema(country);
export const updateCountrySchema = createUpdateSchema(country);
export const selectCountrySchema = createSelectSchema(country);

export const createStateSchema = createInsertSchema(state).omit({
  countryId: true,
});

export const updateStateSchema = createUpdateSchema(state).omit({
  countryId: true,
});

export const selectStateSchema = createSelectSchema(state);

export const createCitySchema = createInsertSchema(city).omit({
  stateId: true,
});

export const updateCitySchema = createUpdateSchema(city).omit({
  stateId: true,
});

export const selectCitySchema = createSelectSchema(city);

export const createAddressSchema = createInsertSchema(address).omit({
  cityId: true,
});

export const updateAddressSchema = createUpdateSchema(address).omit({
  cityId: true,
});

export const selectAddressSchema = createSelectSchema(address);
