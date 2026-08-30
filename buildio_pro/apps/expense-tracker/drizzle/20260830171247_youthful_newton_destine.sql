ALTER TABLE "financial_transaction" ADD COLUMN "is_emi" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "emi_installment_number" integer;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "emi_total_installments" integer;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "international" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "financial_transaction" ADD COLUMN "reward_points" numeric(19, 4);