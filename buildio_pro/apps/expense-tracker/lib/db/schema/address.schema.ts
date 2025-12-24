import { pgTable, text } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { relations } from "drizzle-orm";

export const country = pgTable("country", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  ...auditTimeFields,
});

export const countryRelations = relations(country, ({ many }) => ({
  states: many(state),
}));

export const state = pgTable("state", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  countryId: text("country_id")
    .notNull()
    .references(() => country.id, { onDelete: "cascade" }),
  ...auditTimeFields,
});

// Relations for State
export const stateRelations = relations(state, ({ one, many }) => ({
  country: one(country, {
    fields: [state.countryId],
    references: [country.id],
  }),
  cities: many(city),
}));

export const city = pgTable("city", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  stateId: text("state_id")
    .notNull()
    .references(() => state.id, { onDelete: "cascade" }),
  ...auditTimeFields,
});

// Relations for City
export const cityRelations = relations(city, ({ one, many }) => ({
  state: one(state, {
    fields: [city.stateId],
    references: [state.id],
  }),
  addresses: many(address),
}));

export const address = pgTable("address", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  line3: text("line3"),
  pinCode: text("pincode").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  cityId: text("city_id")
    .notNull()
    .references(() => city.id, { onDelete: "cascade" }),
  ...auditTimeFields,
});

// Relations for Address
export const addressRelations = relations(address, ({ one }) => ({
  city: one(city, {
    fields: [address.cityId],
    references: [city.id],
  }),
}));
