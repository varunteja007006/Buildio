DROP INDEX "topics_slug_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" ("slug") WHERE "deleted_at" IS NULL;