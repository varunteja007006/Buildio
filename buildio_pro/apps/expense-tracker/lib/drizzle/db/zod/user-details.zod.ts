import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { schema } from "../schema";
import { z } from "zod/v4";

const { userPreferences } = schema;

export const createUserPreferencesZSchema = createInsertSchema(userPreferences);
export const updateUserPreferencesZSchema = createUpdateSchema(userPreferences);
export const selectUserPreferencesZSchema = createSelectSchema(userPreferences);
