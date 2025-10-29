import { timestamp } from "drizzle-orm/pg-core";

export const auditTimeFields = {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	deletedAt: timestamp("deleted_at"),
};
