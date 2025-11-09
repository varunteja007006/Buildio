ALTER TABLE "expense" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "income" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "is_recurring" boolean DEFAULT false;