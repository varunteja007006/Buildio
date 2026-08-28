CREATE TABLE "workspace_members" (
	"id" text PRIMARY KEY,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_personal" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DELETE FROM "embeddings";--> statement-breakpoint
DELETE FROM "resources";--> statement-breakpoint
DELETE FROM "documents";--> statement-breakpoint
DELETE FROM "folders";--> statement-breakpoint
DELETE FROM "topics";--> statement-breakpoint
DELETE FROM "chat_threads";--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "workspace_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "workspace_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "workspace_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "workspace_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD COLUMN "workspace_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ADD COLUMN "workspace_id" text NOT NULL;--> statement-breakpoint
DROP INDEX "topics_slug_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" ("workspace_id","slug") WHERE "deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "documents_workspace_idx" ON "documents" ("workspace_id");--> statement-breakpoint
CREATE INDEX "embeddings_workspace_idx" ON "embeddings" ("workspace_id");--> statement-breakpoint
CREATE INDEX "embeddings_resource_idx" ON "embeddings" ("resource_id");--> statement-breakpoint
CREATE INDEX "folders_workspace_idx" ON "folders" ("workspace_id");--> statement-breakpoint
CREATE INDEX "resources_workspace_idx" ON "resources" ("workspace_id");--> statement-breakpoint
CREATE INDEX "chat_threads_workspace_idx" ON "chat_threads" ("workspace_id");--> statement-breakpoint
CREATE INDEX "chat_threads_user_workspace_updated_at_idx" ON "chat_threads" ("user_id","workspace_id","updated_at");--> statement-breakpoint
CREATE INDEX "topics_workspace_idx" ON "topics" ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_idx" ON "workspace_members" ("user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_workspace_idx" ON "workspace_members" ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_user_workspace_uq" ON "workspace_members" ("user_id","workspace_id");--> statement-breakpoint
CREATE INDEX "workspaces_created_by_idx" ON "workspaces" ("created_by");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL;