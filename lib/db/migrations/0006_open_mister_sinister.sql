CREATE TABLE "ingredient_conversions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_id" integer NOT NULL,
	"unit_name" text NOT NULL,
	"conversion_factor" numeric(12, 4) NOT NULL,
	"is_default_purchase" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branch_stock" ADD COLUMN "startup_quantity" numeric(12, 4) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "ingredient_conversions" ADD CONSTRAINT "ingredient_conversions_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;