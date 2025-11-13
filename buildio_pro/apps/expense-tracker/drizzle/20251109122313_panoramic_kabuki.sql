ALTER TABLE "expense" DROP CONSTRAINT "expense_category_id_expense_category_id_fk";
--> statement-breakpoint
ALTER TABLE "income" DROP CONSTRAINT "income_source_id_income_source_id_fk";
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_category_id_expense_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_source_id_income_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."income_source"("id") ON DELETE set null ON UPDATE no action;