ALTER TABLE "folders" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "deleted_at" timestamp with time zone;