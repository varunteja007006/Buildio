import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";

/**
 * * Banks related package
 * https://www.npmjs.com/package/ifsc/v/1.0.10
 */

export const bankAccountTypes = pgTable("bank_account_types", {
	// Primary Key (e.g., 'SAVINGS', 'CURRENT')
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
