CREATE TABLE IF NOT EXISTS "product_drink_discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"drink_id" integer NOT NULL REFERENCES "drinks"("id") ON DELETE CASCADE,
	"branch_id" integer REFERENCES "branches"("id") ON DELETE CASCADE,
	"partner_id" integer REFERENCES "ordering_partners"("id") ON DELETE CASCADE,
	"discount_type" text DEFAULT 'percentage' NOT NULL,
	"discount_value" numeric(8, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "product_drink_discounts_scope_idx" ON "product_drink_discounts" ("drink_id", "branch_id", "partner_id");
