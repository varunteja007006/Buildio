// audit-schema.ts
import {  text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

/**
 * Common timestamp fields for tracking record lifecycle.
 */
export const auditTimelines = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
};

/**
 * Foreign key fields for tracking who created/updated/deleted a record.
 */
export const auditFields = {
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
  deletedBy: text("deleted_by").references(() => user.id, {
    onDelete: "set null",
  }),
};
