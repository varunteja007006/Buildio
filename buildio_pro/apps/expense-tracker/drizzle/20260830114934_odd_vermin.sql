CREATE TYPE "public"."statement_document_type" AS ENUM('credit_card', 'bank_statement');--> statement-breakpoint
CREATE TYPE "public"."statement_upload_status" AS ENUM('pending', 'uploaded', 'processing', 'processed', 'failed');--> statement-breakpoint
CREATE TABLE "statement_upload" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document_type" "statement_document_type" NOT NULL,
	"original_filename" text NOT NULL,
	"s3_key" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size" bigint NOT NULL,
	"status" "statement_upload_status" DEFAULT 'pending' NOT NULL,
	"uploaded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "statement_upload_s3_key_unique" UNIQUE("s3_key")
);
--> statement-breakpoint
ALTER TABLE "statement_upload" ADD CONSTRAINT "statement_upload_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_statement_upload_user_id" ON "statement_upload" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_statement_upload_status" ON "statement_upload" USING btree ("status");