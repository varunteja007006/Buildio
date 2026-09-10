ALTER TABLE "chat_audit_logs" ADD COLUMN "guardrail_checked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD COLUMN "guardrail_flagged" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD COLUMN "guardrail_blocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD COLUMN "guardrail_severity" text;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD COLUMN "guardrail_categories" jsonb;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD COLUMN "guardrail_reason" text;--> statement-breakpoint
ALTER TABLE "chat_audit_logs" ADD COLUMN "guardrail_model" text;