import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";

import {
  userBankAccount,
  userPreferences,
  userProfile,
  userSettings,
} from "../schema/user-extended.schema";

export const createUserPreferencesSchema = createInsertSchema(
  userPreferences,
).omit({
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

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500).optional(),
  image_url: z.union([z.url("Invalid URL"), z.literal("")]).optional(),
});

export const selectUserProfileSchema = createSelectSchema(userProfile);

export const createUserSettingsSchema = createInsertSchema(userSettings).omit({
  user_id: true,
});

export const updateUserSettingsSchema = createUpdateSchema(userSettings).omit({
  user_id: true,
});

export const selectUserSettingsSchema = createSelectSchema(userSettings);

export const createUserBankAccountSchema = createInsertSchema(
  userBankAccount,
).omit({
  user_id: true,
});

export const updateUserBankAccountSchema = createUpdateSchema(
  userBankAccount,
).omit({
  user_id: true,
});

export const selectUserBankAccountSchema = createSelectSchema(userBankAccount);
