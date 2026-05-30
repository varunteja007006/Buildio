import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { platformType } from "../schema/common.schema";

export const createPlatformTypeSchema = createInsertSchema(platformType);
export const updatePlatformTypeSchema = createUpdateSchema(platformType);
export const selectPlatformTypeSchema = createSelectSchema(platformType);
