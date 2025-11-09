import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { auditTimeFields } from "./common.schema";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm";
import { bankAccountTypes, banks } from "./bank.schema";

export const userPreferences = pgTable("user_preferences", {
	id: text("id").primaryKey(),
	// One-to-one relationship with a 'users' table,
	// where 'user_id' is the foreign key.
	user_id: text("user_id")
		.notNull()
		.references(() => user.id, {
			onDelete: "cascade",
		}),
	// Currency (e.g., 'USD', 'EUR', 'JPY')
	currency: text("currency").default("USD").notNull(),
	// Timezone (e.g., 'America/Los_Angeles', 'Europe/London')
	timezone: text("timezone").default("UTC").notNull(),
	...auditTimeFields,
});

export const userPreferencesRelations = relations(
	userPreferences,
	({ one }) => ({
		user: one(user, {
			fields: [userPreferences.user_id],
			references: [user.id],
			relationName: "user_preferences_to_user",
		}),
	})
);

export const userProfile = pgTable("user_profile", {
	id: text("id").primaryKey(),
	user_id: text("user_id")
		.notNull()
		.references(() => user.id, {
			onDelete: "cascade",
		}),
	name: text("name").notNull(),
	description: text("description"),
	image_url: text("image_url"),
	...auditTimeFields,
});

export const userProfileRelations = relations(userProfile, ({ one }) => ({
	user: one(user, {
		fields: [userProfile.user_id],
		references: [user.id],
		relationName: "user_profile_to_user",
	}),
}));

export const userSettings = pgTable("user_settings", {
	id: text("id").primaryKey(),
	user_id: text("user_id")
		.notNull()
		.references(() => user.id, {
			onDelete: "cascade",
		}),
	max_profiles: integer("max_profiles").default(1).notNull(),
	...auditTimeFields,
});

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(user, {
		fields: [userSettings.user_id],
		references: [user.id],
		relationName: "user_settings_to_user",
	}),
}));

export const userBankAccount = pgTable("user_bank_account", {
	id: text("id").primaryKey(),
	user_id: text("user_id")
		.notNull()
		.references(() => user.id, {
			onDelete: "cascade",
		}),
	name: text("name").notNull(),
	bankAccountTypeId: text("bank_account_type")
		.notNull()
		.references(() => bankAccountTypes.id, {
			onDelete: "cascade",
		}),
	bankId: text("bank")
		.notNull()
		.references(() => banks.id, {
			onDelete: "cascade",
		}),
	description: text("description"),
	...auditTimeFields,
});

export const userBankAccountRelations = relations(
	userBankAccount,
	({ one }) => ({
		user: one(user, {
			fields: [userBankAccount.user_id],
			references: [user.id],
			relationName: "user_bank_account_to_user",
		}),
		bankAccountType: one(bankAccountTypes, {
			fields: [userBankAccount.bankAccountTypeId],
			references: [bankAccountTypes.id],
			relationName: "user_bank_account_to_bank_account_types",
		}),
		bank: one(banks, {
			fields: [userBankAccount.bankAccountTypeId],
			references: [banks.id],
			relationName: "user_bank_account_to_banks",
		}),
	})
);
