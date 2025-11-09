CREATE TABLE "user_bank_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"bank_account_type" text NOT NULL,
	"bank" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD CONSTRAINT "user_bank_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD CONSTRAINT "user_bank_account_bank_account_type_bank_account_types_id_fk" FOREIGN KEY ("bank_account_type") REFERENCES "public"."bank_account_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD CONSTRAINT "user_bank_account_bank_banks_id_fk" FOREIGN KEY ("bank") REFERENCES "public"."banks"("id") ON DELETE cascade ON UPDATE no action;