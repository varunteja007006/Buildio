CREATE TABLE "currency" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"symbol" text NOT NULL,
	"name" text NOT NULL,
	"symbol_native" text NOT NULL,
	"decimal_digits" integer NOT NULL,
	"rounding" numeric(10, 4) DEFAULT '0' NOT NULL,
	"name_plural" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "currency_exchange_snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"currency_id" text NOT NULL,
	"as_of" timestamp with time zone NOT NULL,
	"rates" jsonb NOT NULL,
	"provider" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "currency_exchange_snapshot" ADD CONSTRAINT "currency_exchange_snapshot_currency_id_currency_id_fk" FOREIGN KEY ("currency_id") REFERENCES "public"."currency"("id") ON DELETE cascade ON UPDATE no action;