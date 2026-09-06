CREATE TABLE "chat_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"default_model" text DEFAULT 'openai/gpt-4o' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_threads" ADD COLUMN "model" text;--> statement-breakpoint
ALTER TABLE "chat_preferences" ADD CONSTRAINT "chat_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;