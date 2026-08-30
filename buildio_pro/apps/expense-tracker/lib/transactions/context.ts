import type { db as dbInstance, dbSchema as schemaInstance } from "@/lib/db";

export type EnrichmentContext = {
  db: typeof dbInstance;
  dbSchema: typeof schemaInstance;
  userId: string;
};
