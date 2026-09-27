ALTER TABLE "chat_message_feedback" DROP CONSTRAINT "chat_message_feedback_workspace_id_workspaces_id_fk";
--> statement-breakpoint
DROP INDEX "chat_message_feedback_workspace_idx";--> statement-breakpoint
ALTER TABLE "chat_threads" ADD COLUMN "agent_id" text;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_threads_agent_idx" ON "chat_threads" USING btree ("agent_id");--> statement-breakpoint
ALTER TABLE "chat_message_feedback" DROP COLUMN "workspace_id";