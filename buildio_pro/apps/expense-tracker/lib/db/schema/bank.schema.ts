import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { address } from "./address.schema";
import { relations } from "drizzle-orm";

/**
 * * Banks related package
 * https://www.npmjs.com/package/ifsc/v/1.0.10
 */

export const bankAccountTypes = pgTable("bank_account_types", {
	// name Key (e.g., 'SAVINGS', 'CURRENT')
	// Common IDs include:
	// - SAVINGS: Savings Account
	// - CURRENT: Current Account
	// - SALARY: Salary Account
	// - JOINT: Joint Account
	// - STUDENT: Student Account
	// - FIXED_DEPOSIT: Fixed Deposit (CD)
	// - RECURRING_DEPOSIT: Recurring Deposit
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	description: text("description"),
	...auditTimeFields,
});

export const banks = pgTable("banks", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	code: text("code").notNull().unique(),
	ifsc: text("ifsc"), // Indian Financial System Code
	micr: text("micr"), // Magnetic Ink Character Recognition Code
	iin: text("iin"), // Issuer Identification Number
	// Service availability flags (Boolean type for true/false)
	ach_credit: boolean("ach_credit").default(false).notNull(),
	ach_debit: boolean("ach_debit").default(false).notNull(),
	apbs: boolean("apbs").default(false).notNull(), // Aadhaar Payment Bridge System
	nach_debit: boolean("nach_debit").default(false).notNull(), // National Automated Clearing House
	// Type of bank (e.g., 'Foreign', 'Private', 'Public')
	type: text("type").notNull(),
	...auditTimeFields,
});

export const bankAddress = pgTable("bank_address", {
	id: text("id").primaryKey(),
	bankId: text("bank_id")
		.notNull()
		.references(() => banks.id, { onDelete: "cascade" }),
	addressId: text("address_id")
		.notNull()
		.references(() => address.id, { onDelete: "cascade" }),
	...auditTimeFields,
});

// One bank has many bankAddress records
export const bankRelations = relations(banks, ({ many }) => ({
	bankAddresses: many(bankAddress),
}));

// One address can be associated with many bankAddress records
export const addressRelations = relations(address, ({ many }) => ({
	bankAddresses: many(bankAddress),
}));

// Each bankAddress belongs to exactly one bank and one address
export const bankAddressRelations = relations(bankAddress, ({ one }) => ({
	bank: one(banks, {
		fields: [bankAddress.bankId],
		references: [banks.id],
	}),
	address: one(address, {
		fields: [bankAddress.addressId],
		references: [address.id],
	}),
}));

