CREATE TABLE "agent_instruction_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"body" text NOT NULL,
	"created_by" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_tools" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"tool_key" text,
	"toolbox_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_topics" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"topic_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"instructions" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"last_deployed_at" timestamp with time zone,
	"created_by" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_feedback_rating_check" CHECK ("agent_feedback"."rating" >= 1 AND "agent_feedback"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "chat_message_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"message_id" text NOT NULL,
	"thread_id" text NOT NULL,
	"agent_id" text,
	"user_id" text NOT NULL,
	"rating" text NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolbox_tools" (
	"id" text PRIMARY KEY NOT NULL,
	"toolbox_id" text NOT NULL,
	"tool_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "toolboxes" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_instruction_templates" ADD CONSTRAINT "agent_instruction_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_instruction_templates" ADD CONSTRAINT "agent_instruction_templates_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tools" ADD CONSTRAINT "agent_tools_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tools" ADD CONSTRAINT "agent_tools_toolbox_id_toolboxes_id_fk" FOREIGN KEY ("toolbox_id") REFERENCES "public"."toolboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_topics" ADD CONSTRAINT "agent_topics_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_topics" ADD CONSTRAINT "agent_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_feedback" ADD CONSTRAINT "agent_feedback_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_feedback" ADD CONSTRAINT "agent_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_feedback" ADD CONSTRAINT "chat_message_feedback_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_feedback" ADD CONSTRAINT "chat_message_feedback_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_feedback" ADD CONSTRAINT "chat_message_feedback_thread_id_chat_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_feedback" ADD CONSTRAINT "chat_message_feedback_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message_feedback" ADD CONSTRAINT "chat_message_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolbox_tools" ADD CONSTRAINT "toolbox_tools_toolbox_id_toolboxes_id_fk" FOREIGN KEY ("toolbox_id") REFERENCES "public"."toolboxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "toolboxes" ADD CONSTRAINT "toolboxes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_instruction_templates_workspace_idx" ON "agent_instruction_templates" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_instruction_templates_workspace_name_idx" ON "agent_instruction_templates" USING btree ("workspace_id","name") WHERE "agent_instruction_templates"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "agent_tools_agent_idx" ON "agent_tools" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_tools_toolbox_idx" ON "agent_tools" USING btree ("toolbox_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_tools_agent_tool_key_idx" ON "agent_tools" USING btree ("agent_id","tool_key") WHERE "agent_tools"."tool_key" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_tools_agent_toolbox_idx" ON "agent_tools" USING btree ("agent_id","toolbox_id") WHERE "agent_tools"."toolbox_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "agent_topics_agent_idx" ON "agent_topics" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agent_topics_topic_idx" ON "agent_topics" USING btree ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_topics_agent_topic_idx" ON "agent_topics" USING btree ("agent_id","topic_id");--> statement-breakpoint
CREATE INDEX "agents_workspace_idx" ON "agents" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agents_workspace_name_idx" ON "agents" USING btree ("workspace_id","name") WHERE "agents"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "agent_feedback_agent_idx" ON "agent_feedback" USING btree ("agent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_feedback_agent_user_idx" ON "agent_feedback" USING btree ("agent_id","user_id") WHERE "agent_feedback"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "chat_message_feedback_message_idx" ON "chat_message_feedback" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "chat_message_feedback_agent_idx" ON "chat_message_feedback" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "chat_message_feedback_workspace_idx" ON "chat_message_feedback" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "toolbox_tools_toolbox_idx" ON "toolbox_tools" USING btree ("toolbox_id");--> statement-breakpoint
CREATE UNIQUE INDEX "toolbox_tools_toolbox_key_idx" ON "toolbox_tools" USING btree ("toolbox_id","tool_key");--> statement-breakpoint
CREATE INDEX "toolboxes_workspace_idx" ON "toolboxes" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "toolboxes_workspace_name_idx" ON "toolboxes" USING btree ("workspace_id","name") WHERE "toolboxes"."deleted_at" IS NULL;