CREATE TABLE "document_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"workspace_id" text NOT NULL,
	"action" text NOT NULL,
	"document_ids" jsonb,
	"extraction_id" text,
	"template_snapshot" jsonb,
	"instructions_snapshot" text,
	"raw_ai_output" text,
	"final_output" text,
	"model" text,
	"provider" text,
	"usage" jsonb,
	"status" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extraction_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"extraction_id" text NOT NULL,
	"version" integer NOT NULL,
	"source" text NOT NULL,
	"content" text NOT NULL,
	"structured_output" jsonb,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extractions" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"template_id" text,
	"template_snapshot" jsonb,
	"model" text,
	"provider" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"raw_output" text,
	"current_content" text,
	"structured_output" jsonb,
	"error" text,
	"usage" jsonb,
	"auto_ingest" boolean DEFAULT false NOT NULL,
	"resource_id" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "document_id" text;--> statement-breakpoint
ALTER TABLE "document_audit_logs" ADD CONSTRAINT "document_audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_audit_logs" ADD CONSTRAINT "document_audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_audit_logs" ADD CONSTRAINT "document_audit_logs_extraction_id_extractions_id_fk" FOREIGN KEY ("extraction_id") REFERENCES "public"."extractions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_versions" ADD CONSTRAINT "extraction_versions_extraction_id_extractions_id_fk" FOREIGN KEY ("extraction_id") REFERENCES "public"."extractions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_versions" ADD CONSTRAINT "extraction_versions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extractions" ADD CONSTRAINT "extractions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extractions" ADD CONSTRAINT "extractions_template_id_extraction_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."extraction_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extractions" ADD CONSTRAINT "extractions_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_audit_logs_user_idx" ON "document_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_audit_logs_workspace_idx" ON "document_audit_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "document_audit_logs_extraction_idx" ON "document_audit_logs" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "document_audit_logs_created_at_idx" ON "document_audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "extraction_versions_extraction_idx" ON "extraction_versions" USING btree ("extraction_id");--> statement-breakpoint
CREATE INDEX "extractions_document_idx" ON "extractions" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "extractions_template_idx" ON "extractions" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "extractions_status_idx" ON "extractions" USING btree ("status");--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resources_document_idx" ON "resources" USING btree ("document_id");