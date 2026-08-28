import { text, pgTable, index } from "drizzle-orm/pg-core";
import { vector } from "drizzle-orm/pg-core";
import { resources } from "./resources";
import { workspaces } from "./workspaces";

export const embeddings = pgTable(
  "embeddings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    resourceId: text("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => ({
    workspaceIdx: index("embeddings_workspace_idx").on(table.workspaceId),
    resourceIdx: index("embeddings_resource_idx").on(table.resourceId),
    hnswIndex: index("embeddings_hnsw_idx")
      .using("hnsw", table.embedding.op("vector_cosine_ops")),
  }),
);
