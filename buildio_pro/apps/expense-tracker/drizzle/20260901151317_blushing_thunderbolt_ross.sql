DROP INDEX "financial_transaction_user_id_hash_uidx";--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "extraction_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "superseded_at" timestamp;--> statement-breakpoint
ALTER TABLE "statement_upload" ADD COLUMN "extraction_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "financial_transaction_user_id_hash_version_uidx" ON "financial_transaction" USING btree ("user_id","transaction_hash","extraction_version");