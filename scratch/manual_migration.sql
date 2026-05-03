-- Create branches table if it doesn't exist
CREATE TABLE IF NOT EXISTS "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Ensure we have at least one branch
INSERT INTO "branches" (name) VALUES ('Main Branch') ON CONFLICT DO NOTHING;

-- Add branch_id to orders
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='branch_id') THEN
        ALTER TABLE "orders" ADD COLUMN "branch_id" integer;
        -- Assign existing orders to the first branch
        UPDATE "orders" SET "branch_id" = (SELECT id FROM branches LIMIT 1) WHERE "branch_id" IS NULL;
        ALTER TABLE "orders" ALTER COLUMN "branch_id" SET NOT NULL;
    END IF;
END $$;

-- Add branch_id to stock_audits
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stock_audits' AND column_name='branch_id') THEN
        ALTER TABLE "stock_audits" ADD COLUMN "branch_id" integer;
        UPDATE "stock_audits" SET "branch_id" = (SELECT id FROM branches LIMIT 1) WHERE "branch_id" IS NULL;
    END IF;
END $$;

-- Add branch_id to users
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='branch_id') THEN
        ALTER TABLE "users" ADD COLUMN "branch_id" integer;
    END IF;
END $$;

-- Add branch_id to stock
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='branch_stock' AND column_name='branch_id') THEN
        -- branch_stock table already should have branch_id as part of primary key, 
        -- but let's check if the table exists at all
        CREATE TABLE IF NOT EXISTS "branch_stock" (
            "branch_id" integer NOT NULL,
            "ingredient_id" integer NOT NULL,
            "stock_quantity" numeric(10, 4) DEFAULT '0' NOT NULL,
            "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
            CONSTRAINT "branch_stock_branch_id_ingredient_id_pk" PRIMARY KEY("branch_id","ingredient_id")
        );
    END IF;
END $$;
