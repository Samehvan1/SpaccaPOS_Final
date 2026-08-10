CREATE TABLE IF NOT EXISTS "bom_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"bom_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"unit" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "boms" (
	"id" serial PRIMARY KEY NOT NULL,
	"target_ingredient_id" integer NOT NULL,
	"yield_quantity" numeric(12, 4) DEFAULT '1' NOT NULL,
	"yield_unit" text DEFAULT 'ml' NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "boms_target_ingredient_id_unique" UNIQUE("target_ingredient_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manufacturing_run_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"manufacturing_run_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"planned_quantity" numeric(12, 4) NOT NULL,
	"actual_quantity" numeric(12, 4) NOT NULL,
	"unit" text NOT NULL,
	"unit_cost" numeric(12, 4) DEFAULT '0' NOT NULL,
	"total_cost" numeric(12, 4) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "manufacturing_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_id" integer NOT NULL,
	"target_ingredient_id" integer NOT NULL,
	"produced_quantity" numeric(12, 4) NOT NULL,
	"produced_unit" text NOT NULL,
	"total_cost" numeric(12, 4) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"prepared_by" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_bom_id_boms_id_fk" FOREIGN KEY ("bom_id") REFERENCES "public"."boms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "boms" ADD CONSTRAINT "boms_target_ingredient_id_ingredients_id_fk" FOREIGN KEY ("target_ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "manufacturing_run_items" ADD CONSTRAINT "manufacturing_run_items_manufacturing_run_id_manufacturing_runs_id_fk" FOREIGN KEY ("manufacturing_run_id") REFERENCES "public"."manufacturing_runs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "manufacturing_run_items" ADD CONSTRAINT "manufacturing_run_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "manufacturing_runs" ADD CONSTRAINT "manufacturing_runs_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "manufacturing_runs" ADD CONSTRAINT "manufacturing_runs_target_ingredient_id_ingredients_id_fk" FOREIGN KEY ("target_ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "manufacturing_runs" ADD CONSTRAINT "manufacturing_runs_prepared_by_users_id_fk" FOREIGN KEY ("prepared_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;