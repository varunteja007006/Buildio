CREATE TABLE "extraction_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"instructions" text NOT NULL,
	"output_schema" jsonb,
	"default_model" text,
	"created_by" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "extraction_templates" ADD CONSTRAINT "extraction_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_templates" ADD CONSTRAINT "extraction_templates_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "extraction_templates_workspace_idx" ON "extraction_templates" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "extraction_templates_workspace_name_idx" ON "extraction_templates" USING btree ("workspace_id","name") WHERE "extraction_templates"."deleted_at" IS NULL;