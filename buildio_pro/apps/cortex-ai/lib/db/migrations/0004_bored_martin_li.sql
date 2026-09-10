ALTER TABLE "resources" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD COLUMN "deleted_at" timestamp with time zone;