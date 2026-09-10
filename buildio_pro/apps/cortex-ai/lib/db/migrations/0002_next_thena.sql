CREATE TABLE "chat_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"thread_id" text,
	"model" text,
	"provider" text,
	"finish_reason" text,
	"raw_finish_reason" text,
	"user_query" text,
	"response_text" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"total_tokens" integer,
	"cache_read_tokens" integer,
	"cache_write_tokens" integer,
	"reasoning_tokens" integer,
	"text_tokens" integer,
	"time_to_first_output_ms" integer,
	"step_time_ms" integer,
	"response_time_ms" integer,
	"performance" jsonb,
	"usage" jsonb,
	"tool_calls" jsonb,
	"tool_results" jsonb,
	"warnings" jsonb,
	"raw_request" jsonb,
	"raw_response" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD CONSTRAINT "chat_audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD CONSTRAINT "chat_audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD CONSTRAINT "chat_audit_logs_thread_id_chat_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_audit_logs_user_idx" ON "chat_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_audit_logs_workspace_idx" ON "chat_audit_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "chat_audit_logs_thread_idx" ON "chat_audit_logs" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "chat_audit_logs_created_at_idx" ON "chat_audit_logs" USING btree ("created_at");