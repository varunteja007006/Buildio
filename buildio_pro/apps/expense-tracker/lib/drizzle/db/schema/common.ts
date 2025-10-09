import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const auditTimelines = {
  createdAt: timestamp({ mode: "date" }).default(sql`now()`),
  updatedAt: timestamp({ mode: "date" }).default(sql`now()`),
  deletedAt: timestamp({ mode: "date" }),
};
