import {
  pgTable,
  text,
  integer,
  numeric,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { relations } from "drizzle-orm";

export const currency = pgTable("currency", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  symbolNative: text("symbol_native").notNull(),
  decimalDigits: integer("decimal_digits").notNull(),
  rounding: numeric("rounding", { precision: 10, scale: 4 })
    .default("0")
    .notNull(),
  namePlural: text("name_plural"),
  ...auditTimeFields,
});

export const currencyExchangeSnapshot = pgTable("currency_exchange_snapshot", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  currencyId: text("currency_id")
    .notNull()
    .references(() => currency.id, { onDelete: "cascade" }),
  asOf: timestamp("as_of", { withTimezone: true }).notNull(),
  rates: jsonb("rates").notNull(),
  provider: text("provider"),
  ...auditTimeFields,
});

export const currencyExchangeSnapshotRelations = relations(
  currencyExchangeSnapshot,
  ({ one }) => ({
    currency: one(currency, {
      fields: [currencyExchangeSnapshot.currencyId],
      references: [currency.id],
    }),
  }),
);

export const currencyRelations = relations(currency, ({ many }) => ({
  currencyExchangeSnapshots: many(currencyExchangeSnapshot),
}));
