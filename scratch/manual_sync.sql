-- 1. Create branches table
CREATE TABLE IF NOT EXISTS "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" varchar(20) NOT NULL,
	"address" text,
	"phone" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branches_code_unique" UNIQUE("code")
);

-- 2. Add branch_id to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "branch_id" integer;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_branch_id_branches_id_fk') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id");
    END IF;
END $$;

-- 3. Create branch_stock table
CREATE TABLE IF NOT EXISTS "branch_stock" (
	"branch_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"stock_quantity" numeric(12, 4) DEFAULT '0' NOT NULL,
	"low_stock_threshold" numeric(12, 4) DEFAULT '500' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branch_stock_branch_id_ingredient_id_pk" PRIMARY KEY("branch_id","ingredient_id")
);
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branch_stock_branch_id_branches_id_fk') THEN
        ALTER TABLE "branch_stock" ADD CONSTRAINT "branch_stock_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branch_stock_ingredient_id_ingredients_id_fk') THEN
        ALTER TABLE "branch_stock" ADD CONSTRAINT "branch_stock_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Add branch_id to stock_movements
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "branch_id" integer;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stock_movements_branch_id_branches_id_fk') THEN
        ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "branches"("id");
    END IF;
END $$;
