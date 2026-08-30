CREATE TYPE "public"."transaction_direction" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'income', 'transfer', 'investment', 'loan_payment', 'insurance', 'refund', 'interest', 'fee', 'cash_withdrawal', 'round_up', 'unknown');--> statement-breakpoint
CREATE TABLE "financial_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bank_account_id" text,
	"statement_upload_id" text,
	"transaction_date" timestamp DEFAULT now() NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"currency_id" text,
	"direction" "transaction_direction" NOT NULL,
	"transaction_type" "transaction_type" DEFAULT 'unknown' NOT NULL,
	"merchant_name" text,
	"counterparty_name" text,
	"description" text,
	"raw_description" text,
	"reference_number" text,
	"balance_after" numeric(19, 4),
	"payment_method_id" text,
	"category_id" text,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"is_transfer" boolean DEFAULT false NOT NULL,
	"linked_transaction_id" text,
	"extraction_confidence" numeric(5, 4),
	"transaction_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "investment_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"user_id" text NOT NULL,
	"platform_id" text,
	"investment_type_id" text,
	"units" numeric(19, 8),
	"unit_price" numeric(19, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transaction_transfer" (
	"id" text PRIMARY KEY NOT NULL,
	"from_transaction_id" text NOT NULL,
	"to_transaction_id" text NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "expense" DROP CONSTRAINT "expense_budget_budget_id_fk";
--> statement-breakpoint
ALTER TABLE "income" DROP CONSTRAINT "income_payment_method_id_payment_methods_id_fk";
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "transaction_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "budget_id" text;--> statement-breakpoint
ALTER TABLE "expense_category" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "income" ADD COLUMN "transaction_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD COLUMN "account_number_masked" text;--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD COLUMN "account_number_hash" text;--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD COLUMN "currency_id" text;--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD COLUMN "last_four" text;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_bank_account_id_user_bank_account_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."user_bank_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_statement_upload_id_statement_upload_id_fk" FOREIGN KEY ("statement_upload_id") REFERENCES "public"."statement_upload"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_category_id_expense_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_linked_transaction_id_financial_transaction_id_fk" FOREIGN KEY ("linked_transaction_id") REFERENCES "public"."financial_transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_transaction_id_financial_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."financial_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_platform_id_investment_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."investment_platforms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_transaction" ADD CONSTRAINT "investment_transaction_investment_type_id_investment_types_id_fk" FOREIGN KEY ("investment_type_id") REFERENCES "public"."investment_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_transfer" ADD CONSTRAINT "transaction_transfer_from_transaction_id_financial_transaction_id_fk" FOREIGN KEY ("from_transaction_id") REFERENCES "public"."financial_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_transfer" ADD CONSTRAINT "transaction_transfer_to_transaction_id_financial_transaction_id_fk" FOREIGN KEY ("to_transaction_id") REFERENCES "public"."financial_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "financial_transaction_user_id_hash_uidx" ON "financial_transaction" USING btree ("user_id","transaction_hash");--> statement-breakpoint
CREATE INDEX "idx_financial_transaction_user_id" ON "financial_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_financial_transaction_bank_account_id" ON "financial_transaction" USING btree ("bank_account_id");--> statement-breakpoint
CREATE INDEX "idx_financial_transaction_statement_upload_id" ON "financial_transaction" USING btree ("statement_upload_id");--> statement-breakpoint
CREATE INDEX "idx_financial_transaction_transaction_date" ON "financial_transaction" USING btree ("transaction_date");--> statement-breakpoint
CREATE INDEX "idx_financial_transaction_category_id" ON "financial_transaction" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_financial_transaction_payment_method_id" ON "financial_transaction" USING btree ("payment_method_id");--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_transaction_id_financial_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."financial_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_budget_id_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_category" ADD CONSTRAINT "expense_category_parent_id_expense_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expense_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_transaction_id_financial_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."financial_transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_bank_account" ADD CONSTRAINT "user_bank_account_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" DROP COLUMN "income";--> statement-breakpoint
ALTER TABLE "expense" DROP COLUMN "account";--> statement-breakpoint
ALTER TABLE "expense" DROP COLUMN "budget";--> statement-breakpoint
ALTER TABLE "income" DROP COLUMN "income";--> statement-breakpoint
ALTER TABLE "income" DROP COLUMN "payment_method_id";