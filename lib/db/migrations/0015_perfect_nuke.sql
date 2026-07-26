CREATE TABLE "offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"buy_amount" integer NOT NULL,
	"free_amount" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "offer_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "offer_discount" numeric(8, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;