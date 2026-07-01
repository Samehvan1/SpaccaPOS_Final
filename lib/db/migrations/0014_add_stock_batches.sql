CREATE TABLE "branch_inventory_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"batch_number" text,
	"sealed_expiry_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"is_opened" boolean DEFAULT false NOT NULL,
	"opened_at" timestamp with time zone,
	"quantity" numeric(12, 4) DEFAULT '0' NOT NULL,
	"initial_quantity" numeric(12, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ingredients" ADD COLUMN "opened_shelf_life_days" integer;--> statement-breakpoint
ALTER TABLE "branch_inventory_batches" ADD CONSTRAINT "branch_inventory_batches_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branch_inventory_batches" ADD CONSTRAINT "branch_inventory_batches_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;