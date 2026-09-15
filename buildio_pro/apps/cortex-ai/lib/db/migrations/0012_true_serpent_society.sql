ALTER TABLE "documents" ADD COLUMN "deleted_batch_id" text;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "deleted_batch_id" text;--> statement-breakpoint
ALTER TABLE "extractions" ADD COLUMN "deleted_batch_id" text;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "deleted_batch_id" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "deleted_batch_id" text;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "deleted_batch_id" text;