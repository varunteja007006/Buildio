import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Common audit timestamps to be spread into all tables.
 */
export const auditTimeFields = {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	deletedAt: timestamp("deleted_at"),
};

/**
 * Platform type --> App, Website, etc...
 */
export const platformType = pgTable("platform_type", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	description: text("description"),
});
