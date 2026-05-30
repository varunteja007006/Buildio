CREATE TABLE "event_status" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "event_status_label_unique" UNIQUE("label")
);
--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "status_id" text;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_status_id_event_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."event_status"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" DROP COLUMN "status";