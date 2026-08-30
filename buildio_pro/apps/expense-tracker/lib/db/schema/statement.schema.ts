import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { auditTimeFields } from "./common.schema";

export const statementDocumentType = pgEnum("statement_document_type", [
  "credit_card",
  "bank_statement",
]);

export const statementUploadStatus = pgEnum("statement_upload_status", [
  "pending",
  "uploaded",
  "processing",
  "processed",
  "failed",
]);

export const statementUpload = pgTable(
  "statement_upload",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    documentType: statementDocumentType("document_type").notNull(),
    originalFilename: text("original_filename").notNull(),
    s3Key: text("s3_key").notNull().unique(),
    contentType: text("content_type").notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    status: statementUploadStatus("status").default("pending").notNull(),
    uploadedAt: timestamp("uploaded_at"),
    ...auditTimeFields,
  },
  (table) => [
    index("idx_statement_upload_user_id").on(table.userId),
    index("idx_statement_upload_status").on(table.status),
  ],
);

export const statementUploadRelations = relations(
  statementUpload,
  ({ one }) => ({
    user: one(user, {
      fields: [statementUpload.userId],
      references: [user.id],
      relationName: "statement_upload_to_user",
    }),
  }),
);
