import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { statementUpload } from "../schema/statement.schema";

export const createStatementUploadSchema = createInsertSchema(statementUpload);
export const selectStatementUploadSchema = createSelectSchema(statementUpload);
