CREATE TABLE "folders" (
	"id" text PRIMARY KEY,
	"topic_id" text NOT NULL,
	"parent_folder_id" text,
	"name" text NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "folders_depth_check" CHECK ("depth" BETWEEN 0 AND 5)
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "topic_id" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "folder_id" text;--> statement-breakpoint
CREATE INDEX "documents_topic_idx" ON "documents" ("topic_id");--> statement-breakpoint
CREATE INDEX "documents_folder_idx" ON "documents" ("folder_id");--> statement-breakpoint
CREATE INDEX "folders_topic_idx" ON "folders" ("topic_id");--> statement-breakpoint
CREATE INDEX "folders_parent_idx" ON "folders" ("parent_folder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" ("slug");--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_folders_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_folder_id_folders_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "folders"("id") ON DELETE CASCADE;