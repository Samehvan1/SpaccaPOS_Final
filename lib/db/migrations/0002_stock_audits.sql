CREATE TABLE "stock_audit_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"expected_quantity" numeric(12, 4) NOT NULL,
	"actual_quantity" numeric(12, 4) NOT NULL,
	"final_quantity" numeric(12, 4),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "stock_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" integer NOT NULL,
	"approved_by" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "stock_audit_items" ADD CONSTRAINT "stock_audit_items_audit_id_stock_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."stock_audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_audit_items" ADD CONSTRAINT "stock_audit_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_audits" ADD CONSTRAINT "stock_audits_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_audits" ADD CONSTRAINT "stock_audits_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;