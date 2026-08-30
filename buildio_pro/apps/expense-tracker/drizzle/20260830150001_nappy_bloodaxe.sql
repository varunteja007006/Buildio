ALTER TABLE "statement_upload" ADD COLUMN "processed_transactions_count" integer;--> statement-breakpoint
ALTER TABLE "statement_upload" ADD COLUMN "processing_error" text;--> statement-breakpoint
ALTER TABLE "statement_upload" ADD COLUMN "extraction_model" text;--> statement-breakpoint
ALTER TABLE "statement_upload" ADD COLUMN "statement_metadata" jsonb;