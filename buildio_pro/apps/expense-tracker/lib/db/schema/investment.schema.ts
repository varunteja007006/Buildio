import { pgTable, text } from "drizzle-orm/pg-core";
import { auditTimeFields, platformType } from "./common.schema";

/**
 * Stores metadata for different types of investments.
 * Examples:
 * - EQUITY (Stocks, Mutual Funds - Equity)
 * - DEBT (Bonds, Debt Funds)
 * - REAL_ESTATE
 * - GOLD
 * - CRYPTO
 * - ETF
 * - PPF / EPF / NPS
 *
 * This is analogous in spirit to payment provider/method metadata and
 * user/bank metadata, and is intended to be referenced by concrete
 * investment holding/transaction tables.
 */
export const investmentTypes = pgTable("investment_types", {
	// Stable identifier to be used across the app and seed data
	// e.g. "EQUITY", "DEBT", "REAL_ESTATE", "ETF"
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	// Human-friendly display name
	name: text("name").notNull(),

	// Optional description for UI and reporting
	description: text("description"),

	// Optional category/grouping dimension (e.g. "MARKET_LINKED", "FIXED_INCOME")
	category: text("category"),

	// Optional risk label (e.g. "LOW", "MEDIUM", "HIGH")
	riskLevel: text("risk_level"),

	// Optional liquidity indicator / horizon notes (e.g. "HIGH_LIQUIDITY", "LONG_TERM")
	liquidityProfile: text("liquidity_profile"),

	...auditTimeFields,
});

/**
 * Stores metadata for investment platforms / houses / apps / websites
 * used to execute or hold investments.
 *
 * Examples:
 * - Zerodha, Groww, Upstox
 * - HDFC Securities, ICICI Direct
 * - Kuvera, INDmoney
 * - Direct AMC platforms (e.g. SBI MF, HDFC MF)
 *
 * This table is intended to be referenced by user-specific accounts
 * or holdings tables to indicate where an investment is held or via
 * which platform it is executed.
 */
export const investmentPlatforms = pgTable("investment_platforms", {
	// Stable identifier, e.g. "ZERODHA", "GROWW", "HDFC_SECURITIES"
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	// Human-friendly platform name
	name: text("name").notNull(),
	// Optional description (e.g. "Discount broker", "Direct mutual fund platform")
	description: text("description"),
	// Optional official website URL
	websiteUrl: text("website_url"),
	// Optional category/type: "BROKER", "ROBO_ADVISOR", "AMC_DIRECT", "BANK_BROKER", etc.
	platformType: text("platform_type").references(() => platformType.id, {
		onDelete: "set null",
	}),
	// Optional country / region code for regulatory context
	country: text("country"),
	...auditTimeFields,
});
