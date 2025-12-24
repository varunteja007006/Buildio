import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import {
  userPreferences,
  userProfile,
  userSettings,
  userBankAccount,
} from "../schema/user-extended.schema";

export const createUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  user_id: true,
});

export const updateUserPreferencesSchema = createUpdateSchema(
  userPreferences,
).omit({
  user_id: true,
});

export const selectUserPreferencesSchema = createSelectSchema(userPreferences);

export const createUserProfileSchema = createInsertSchema(userProfile).omit({
  user_id: true,
});

export const updateUserProfileSchema = createUpdateSchema(userProfile).omit({
  user_id: true,
});

export const selectUserProfileSchema = createSelectSchema(userProfile);

export const createUserSettingsSchema = createInsertSchema(userSettings).omit({
  user_id: true,
});

export const updateUserSettingsSchema = createUpdateSchema(userSettings).omit({
  user_id: true,
});

export const selectUserSettingsSchema = createSelectSchema(userSettings);

export const createUserBankAccountSchema = createInsertSchema(userBankAccount).omit({
  user_id: true,
});

export const updateUserBankAccountSchema = createUpdateSchema(userBankAccount).omit({
  user_id: true,
});

export const selectUserBankAccountSchema = createSelectSchema(userBankAccount);
